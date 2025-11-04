# todolist_backend/asgi.py
import os
import jwt
from urllib.parse import parse_qs
from django.conf import settings
from django.core.asgi import get_asgi_application
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.db import database_sync_to_async
from court.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'todolist_backend.settings')

User = get_user_model()

@database_sync_to_async
def get_user_from_db(user_id):
    """
    Asynchronously retrieves a user from the database.
    """
    try:
        user = User.objects.get(id=user_id)
        print(f"✅ JWT Auth: Found user '{user.username}' (ID: {user.id})")
        return user
    except User.DoesNotExist:
        print(f"❌ JWT Auth: User with ID {user_id} not found")
        return AnonymousUser()

class JWTAuthMiddleware:
    """
    Custom middleware for WebSocket JWT authentication from a query string.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]
        print(f"🔍 Query token received: {token}")

        scope['user'] = AnonymousUser()

        if token:
            try:
                decoded_data = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = decoded_data.get('user_id')

                if user_id:
                    scope['user'] = await get_user_from_db(user_id)
                else:
                    print("❌ JWT Token does not contain 'user_id'")

            except jwt.ExpiredSignatureError:
                print("❌ JWT Token has expired")
            except jwt.InvalidTokenError as e:
                print(f"❌ Invalid JWT token: {e}")
            except Exception as e:
                print(f"❌ An unexpected error occurred during token decoding: {e}")

        return await self.app(scope, receive, send)

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
