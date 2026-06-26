from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

from auctions.models import Auction


@shared_task
def close_expired_auctions():
    now = timezone.now()

    # Активирай аукциони чийто start_time е минал
    Auction.objects.filter(
        status=Auction.Status.DRAFT,
        start_time__lte=now
    ).update(status=Auction.Status.ACTIVE)

    # Затвори изтеклите active аукциони
    expired = Auction.objects.filter(
        status=Auction.Status.ACTIVE,
        end_time__lt=now
    )

    for auction in expired:
        top_bid = auction.bids.order_by('-amount').first()
        auction.status = Auction.Status.ENDED
        if top_bid:
            auction.winner = top_bid.bidder
        auction.save(update_fields=['status', 'winner'])
        notify_auction_ended.delay(auction.id)


@shared_task
def notify_auction_ended(auction_id):
    from .models import Auction

    try:
        auction = Auction.objects.get(id=auction_id)
    except Auction.DoesNotExist:
        return
    bidders = (
        auction.bids
        .select_related('bidder')
        .values_list('bidder__email', 'bidder__first_name')
        .distinct()
    )

    for email, first_name in bidders:
        if auction.winner and auction.winner.email == email:
            send_mail(
                subject=f'🏆 You won: {auction.title}',
                message=f'Congratulations {first_name}! You won "{auction.title}" with ${auction.current_price}.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
            )
        else:
            send_mail(
                subject=f'Auction ended: {auction.title}',
                message=f'Hi {first_name}, the auction "{auction.title}" has ended. The winning bid was ${auction.current_price}.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
            )