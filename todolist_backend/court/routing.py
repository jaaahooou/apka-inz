from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Istniejący czat
    re_path(r'ws/chat/(?P<room_id>\w+)/$', consumers.ChatConsumer.as_asgi()),
    
    # NOWY kanał powiadomień
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
]