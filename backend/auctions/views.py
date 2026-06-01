from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response

from .models import Auction
from .serializers import AuctionSerializer, BidSerializer, BidCreateSerializer
from .permissions import IsSellerOrReadOnly
from .services import place_bid


class AuctionViewSet(viewsets.ModelViewSet):
    queryset = Auction.objects.all()
    serializer_class = AuctionSerializer
    permission_classes = (IsAuthenticatedOrReadOnly, IsSellerOrReadOnly)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def bid(self, request, pk=None):
        serializer = BidCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        bid = place_bid(
            auction_id=pk,
            bidder=request.user,
            amount=serializer.validated_data["amount"]
        )
        return Response(BidSerializer(bid).data, status=status.HTTP_200_OK)
