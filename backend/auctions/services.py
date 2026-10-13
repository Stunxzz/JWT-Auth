from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied
from .models import Auction, Bid
from .tasks import notify_outbid

def place_bid(auction_id, bidder, amount):
    with transaction.atomic():
        auction = get_object_or_404(Auction.objects.select_for_update(), pk=auction_id)

        if auction.status != Auction.Status.ACTIVE:
            raise ValidationError("This auction is not active")
        now = timezone.now()
        if now < auction.start_time:
            raise ValidationError("This auction has not started yet.")

        if now >= auction.end_time:
            raise ValidationError("This auction has already ended.")

        if auction.seller_id == bidder.id:
            raise PermissionDenied("You cannot bid on your own auction.")

        if auction.bids.exists():
            min_required = auction.current_price + auction.min_increment
        else:
            min_required = auction.current_price

        if amount < min_required:
            raise ValidationError(f"Bid must be at least {min_required}.")

        # Намираме предишния bidder преди да създадем новия bid
        previous_bid = auction.bids.order_by('-created_at').first()

        bid = Bid.objects.create(
            auction=auction,
            bidder=bidder,
            amount=amount,
        )
        auction.current_price = amount
        auction.save(update_fields=["current_price", "updated_at"])

    # Извън transaction — notify предишния bidder
    if previous_bid and previous_bid.bidder_id != bidder.id:
        notify_outbid.delay(auction.id, previous_bid.bidder_id)

    return bid