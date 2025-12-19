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

# Importujemy model wewnątrz metod lub po sprawdzeniu gotowości aplikacji, 
# ale w middleware zazwyczaj jest to bezpieczne, jeśli django.setup() był wywołany.
# from court.models import AuditLog (zostawiamy import lokalny, aby uniknąć błędów startowych)

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
        user_id = validated_token.get("user_id")
        if not user_id:
            print("⚠️ Token nie zawiera pola 'user_id'")
            return AnonymousUser()
            
        user = User.objects.get(id=user_id)
        # print(f"✅ Znaleziono użytkownika: {user.username}")
        return user
    except User.DoesNotExist:
        print(f"❌ Użytkownik o ID {validated_token.get('user_id')} nie istnieje.")
        return AnonymousUser()
    except Exception as e:
        print(f"❌ Błąd podczas pobierania użytkownika: {e}")
        return AnonymousUser()


# --- MIDDLEWARE 1: LOGOWANIE AUDYTOWE (HTTP) ---

class AuditLogMiddleware:
    """Middleware do automatycznego logowania akcji HTTP do tabeli AuditLog"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logged_paths = [
            '/court/cases/',
            '/court/documents/',
            '/court/hearings/',
            '/court/users/',
            '/court/notifications/',
            '/court/messages/',
        ]
        self.logged_methods = ['POST', 'PUT', 'PATCH', 'DELETE']
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Logujemy tylko zalogowanych użytkowników
        if not request.user.is_authenticated:
            return response
        
        path = request.path
        method = request.method
        
        if method not in self.logged_methods:
            return response
        
        should_log = any(path.startswith(p) for p in self.logged_paths)
        if not should_log:
            return response
        
        try:
            # Importujemy model tutaj, gdy aplikacja jest już gotowa
            from court.models import AuditLog

            action_map = {
                'POST': 'CREATE',
                'PUT': 'UPDATE',
                'PATCH': 'UPDATE',
                'DELETE': 'DELETE',
            }
            
            action = action_map.get(method, 'UNKNOWN')
            path_parts = path.strip('/').split('/')
            
            object_type = self._extract_object_type(path_parts)
            object_id = self._extract_object_id(path_parts)
            
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
            # print(f"⚠️ AuditLog error: {str(e)}")
            pass
        
        return response
    
    def _extract_object_type(self, path_parts):
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
        for part in path_parts:
            if part.isdigit():
                return int(part)
        return None


# --- MIDDLEWARE 2: AUTORYZACJA WEBSOCKET (ASGI) ---

class JwtAuthMiddleware:
    """
    Middleware do autoryzacji JWT w WebSocketach.
    Pobiera token z parametru ?token= w URL.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if token:
            try:
                # Dekodowanie tokena
                # settings.SECRET_KEY musi być identyczne jak przy podpisywaniu
                decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                
                # Pobranie użytkownika (asynchronicznie)
                scope["user"] = await get_user(decoded_data)
                
            except (InvalidToken, TokenError) as e:
                print(f"❌ Token nieważny/błędny: {e}")
                scope["user"] = AnonymousUser()
            except Exception as e:
                print(f"❌ Błąd autoryzacji WebSocket: {e}")
                scope["user"] = AnonymousUser()
        else:
            print("⚠️ Brak tokena w URL WebSocket")
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)