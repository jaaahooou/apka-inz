from court.models import AuditLog
from django.utils import timezone
import json

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class AuditLogMiddleware:
    """Middleware do automatycznego logowania akcji"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Loguj tylko te ścieżki
        self.logged_paths = [
            '/court/cases/',
            '/court/documents/',
            '/court/hearings/',
            '/court/users/',
            '/court/notifications/',
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
            # /court/cases/1/update/ → 'Case'
            path_parts = path.split('/')
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
        }
        
        for i, part in enumerate(path_parts):
            if part in type_map:
                return type_map[part]
        
        return 'UNKNOWN'
    
    def _extract_object_id(self, path_parts):
        """Wyciągnij ID obiektu z ścieżki"""
        # /court/cases/1/update/ → ID = 1
        for i, part in enumerate(path_parts):
            if part.isdigit():
                return int(part)
        return None