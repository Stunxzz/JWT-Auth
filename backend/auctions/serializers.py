from rest_framework import serializers
from .models import Auction, Bid, AuctionImage
from django.utils import timezone


class AuctionImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuctionImage
        fields = ['id', 'image', 'is_primary', 'order', 'uploaded_at']
        read_only_fields = ['uploaded_at']

    def validate(self, attrs):
        auction = self.context['auction']
        if auction.images.count() >= 10:
            raise serializers.ValidationError("Maximum 10 images per auction.")
        return attrs


class BidSerializer(serializers.ModelSerializer):
    bidder_name = serializers.CharField(source="bidder.get_full_name", read_only=True)

    class Meta:
        model = Bid
        fields = ("id", "amount", "bidder_name", "created_at")


class BidCreateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)


class AuctionSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source="seller.get_full_name", read_only=True)
    bids = BidSerializer(many=True, read_only=True)
    images = AuctionImageSerializer(many=True, read_only=True)  # добавено

    class Meta:
        model = Auction
        fields = (
            "id", "title", "description",
            "starting_price", "current_price", "min_increment",
            "start_time", "end_time", "status",
            "seller_name", "winner", "bids", "images", "created_at",  # images добавено
        )
        read_only_fields = ("current_price", "status", "winner")

    def create(self, validated_data):
        validated_data["current_price"] = validated_data["starting_price"]
        validated_data["seller"] = self.context["request"].user
        if validated_data["start_time"] <= timezone.now():
            validated_data["status"] = Auction.Status.ACTIVE
        return super().create(validated_data)