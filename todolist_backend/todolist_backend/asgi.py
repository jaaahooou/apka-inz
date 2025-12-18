import os
import django

# Inicjalizacja Django musi być PIERWSZA
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'todolist_backend.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from court.routing import websocket_urlpatterns
# Importujemy zaktualizowane middleware
from court.middleware import JwtAuthMiddleware 

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    # Owijamy router WebSocket w middleware autoryzacyjny
    "websocket": JwtAuthMiddleware(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})