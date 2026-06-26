from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Auction, AuctionImage
from .serializers import AuctionSerializer, BidSerializer, BidCreateSerializer, AuctionImageSerializer
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


class AuctionImageUploadView(generics.CreateAPIView):
    serializer_class = AuctionImageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    #Image and fail reader form react

    def get_auction(self):
        return get_object_or_404(
            Auction,
            pk=self.kwargs['auction_pk'],
            seller=self.request.user
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['auction'] = self.get_auction()
        return context

    def perform_create(self, serializer):
        auction = self.get_auction()
        serializer.save(auction=auction)


class AuctionImageDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AuctionImage.objects.filter(
            auction__seller=self.request.user
        )
