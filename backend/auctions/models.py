from django.conf import settings
from django.db import models


class Auction(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        ACTIVE = 'active', 'Active'
        ENDED = 'ended', 'Ended'
        CANCELED = 'canceled', 'Canceled'

    seller = models.ForeignKey(settings.AUTH_USER_MODEL,
                               on_delete=models.CASCADE,
                               related_name='auctions', )

    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    starting_price = models.DecimalField(max_digits=10, decimal_places=2)
    current_price = models.DecimalField(max_digits=10, decimal_places=2)
    min_increment = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    winner = models.ForeignKey(settings.AUTH_USER_MODEL,
                               on_delete=models.CASCADE,
                               null=True,
                               blank=True,
                               related_name='won_auctions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'auctions'

    def __str__(self):
        return f'{self.title} - ({self.status})'


class Bid(models.Model):
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='bids')
    bidder = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bids')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['auction', '-created_at']),
        ]
        db_table = 'bid'

    def __str__(self):
        return f"{self.bidder} → {self.amount} on {self.auction.title}"


class AuctionImage(models.Model):
    auction = models.ForeignKey(
        Auction,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='auctions/')
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'auction_image'
        ordering = ['order', 'uploaded_at']

    def __str__(self):
        return f"Image for {self.auction.title}"