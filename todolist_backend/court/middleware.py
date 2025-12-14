from court.models import AuditLog
from django.utils import timezone
import json
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from jwt import decode as jwt_decode
from django.conf import settings
from urllib.parse import parse_qs

User = get_user_model()

# --- POMOCNICZE FUNKCJE ---

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@database_sync_to_async
def get_user(validated_token):
    try:
        user = User.objects.get(id=validated_token["user_id"])
        return user
    except User.DoesNotExist:
        return AnonymousUser()


# --- MIDDLEWARE 1: LOGOWANIE AUDYTOWE (HTTP) ---

class AuditLogMiddleware:
    """Middleware do automatycznego logowania akcji HTTP"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Loguj tylko te ścieżki
        self.logged_paths = [
            '/court/cases/',
            '/court/documents/',
            '/court/hearings/',
            '/court/users/',
            '/court/notifications/',
            '/court/messages/', # Warto dodać logowanie wysyłania wiadomości
        ]
        # Nie loguj GET requesty (tylko CREATE, UPDATE, DELETE)
        self.logged_methods = ['POST', 'PUT', 'PATCH', 'DELETE']
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Loguj tylko zalogowanych użytkowników
        if not request.user.is_authenticated:
            return response
        
        path = request.path
        method = request.method
        
        # Loguj tylko wybrane metody
        if method not in self.logged_methods:
            return response
        
        # Loguj tylko wybrane ścieżki
        should_log = any(path.startswith(p) for p in self.logged_paths)
        if not should_log:
            return response
        
        try:
            # Mapuj metody HTTP na akcje
            action_map = {
                'POST': 'CREATE',
                'PUT': 'UPDATE',
                'PATCH': 'UPDATE',
                'DELETE': 'DELETE',
            }
            
            action = action_map.get(method, 'UNKNOWN')
            
            # Wyciągnij typ obiektu z ścieżki
            path_parts = path.strip('/').split('/')
            object_type = self._extract_object_type(path_parts)
            
            # Wyciągnij ID obiektu
            object_id = self._extract_object_id(path_parts)
            
            # Loguj akcję
            AuditLog.objects.create(
                user=request.user,
                action=action,
                object_type=object_type,
                object_id=object_id,
                description=f"{action} via {method} {path}",
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
            )
        except Exception as e:
            # Nie przerywaj żądania jeśli logging się nie powiedzie
            print(f"AuditLog error: {str(e)}")
            pass
        
        return response
    
    def _extract_object_type(self, path_parts):
        """Wyciągnij typ obiektu z ścieżki"""
        type_map = {
            'cases': 'Case',
            'documents': 'Document',
            'hearings': 'Hearing',
            'users': 'User',
            'notifications': 'Notification',
            'messages': 'Message',
        }
        
        for part in path_parts:
            if part in type_map:
                return type_map[part]
        
        return 'UNKNOWN'
    
    def _extract_object_id(self, path_parts):
        """Wyciągnij ID obiektu z ścieżki"""
        # np. court/cases/1/update/ -> ID = 1
        for part in path_parts:
            if part.isdigit():
                return int(part)
        return None


# --- MIDDLEWARE 2: AUTORYZACJA WEBSOCKET (ASGI) ---

class JwtAuthMiddleware:
    """
    Middleware do autoryzacji JWT w WebSocketach.
    Szuka tokena w query string: ws://...?token=<token>
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Pobieramy query string z adresu URL
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if token:
            try:
                # Walidacja tokena (biblioteka simplejwt)
                UntypedToken(token)
                
                # Dekodowanie ręczne, żeby wyciągnąć user_id
                decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                
                # Pobranie użytkownika z bazy (asynchronicznie)
                scope["user"] = await get_user(decoded_data)
                
            except (InvalidToken, TokenError, Exception) as e:
                print(f"❌ Błąd autoryzacji WebSocket: {e}")
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)