from rest_framework import serializers
from .models import Auction, Bid


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

    class Meta:
        model = Auction
        fields = (
            "id", "title", "description",
            "starting_price", "current_price", "min_increment",
            "start_time", "end_time", "status",
            "seller_name", "winner", "bids", "created_at",
        )
        read_only_fields = ("current_price", "status", "winner")

    def create(self, validated_data):
        validated_data["current_price"] = self.validated_data["starting_price"]
        validated_data["seller"] = self.context["request"].user
        return super().create(validated_data)
