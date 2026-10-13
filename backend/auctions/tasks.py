from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from notifications.models import Notification


@shared_task
def close_expired_auctions():
    from .models import Auction

    now = timezone.now()

    Auction.objects.filter(
        status=Auction.Status.DRAFT,
        start_time__lte=now
    ).update(status=Auction.Status.ACTIVE)

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

    # Всички уникални bidders
    bidders = (
        auction.bids
        .select_related('bidder')
        .values_list('bidder', flat=True)
        .distinct()
    )

    for bidder_id in bidders:
        if auction.winner and auction.winner.id == bidder_id:
            Notification.objects.create(
                user_id=bidder_id,
                auction=auction,
                type=Notification.Type.WON
            )
        else:
            Notification.objects.create(
                user_id=bidder_id,
                auction=auction,
                type=Notification.Type.ENDED
            )

    Notification.objects.create(
        user=auction.seller,
        auction=auction,
        type=Notification.Type.ENDED
    )


@shared_task
def notify_outbid(auction_id, previous_bidder_id):
    from .models import Auction

    try:
        auction = Auction.objects.get(id=auction_id)
    except Auction.DoesNotExist:
        return

    Notification.objects.create(
        user_id=previous_bidder_id,
        auction=auction,
        type=Notification.Type.OUTBID
    )