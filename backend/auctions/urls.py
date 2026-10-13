from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import AuctionViewSet, AuctionImageUploadView, AuctionImageDeleteView

router = DefaultRouter()
router.register("auctions", AuctionViewSet, basename="auction")

urlpatterns = router.urls + [
    path('auctions/<int:auction_pk>/images/', AuctionImageUploadView.as_view(), name='auction-image-upload'),
    path('auctions/images/<int:pk>/', AuctionImageDeleteView.as_view(), name='auction-image-delete'),
]