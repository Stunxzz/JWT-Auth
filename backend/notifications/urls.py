from django.urls import path
from .views import NotificationListView, MarkAllReadView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notifications'),
    path('read/', MarkAllReadView.as_view(), name='notifications-read'),
]