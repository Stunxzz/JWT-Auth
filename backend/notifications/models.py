from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings


class Notification(models.Model):
    class Type(models.TextChoices):
        OUTBID = 'outbid', 'You were outbid'
        WON = 'won', 'You won the auction'
        ENDED = 'ended', 'Auction ended'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    auction = models.ForeignKey(
        'auctions.Auction',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    type = models.CharField(max_length=20, choices=Type.choices)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'notifications'

    def __str__(self):
        return f"{self.user} - {self.type} - {self.auction}"