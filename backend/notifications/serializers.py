from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    auction_title = serializers.CharField(source='auction.title', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'type', 'auction_title', 'is_read', 'created_at']
        read_only_fields = ['type', 'auction_title', 'created_at']