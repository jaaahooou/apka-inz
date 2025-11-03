from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from court.models import AuditLog
from court.serializers import AuditLogSerializer

@api_view(['GET'])
def audit_log_list(request):
    """Lista wszystkich wpisów audytu (tylko admini)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Brak uprawnień'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    logs = AuditLog.objects.all()
    
    # Filtry opcjonalne
    user_id = request.query_params.get('user')
    action = request.query_params.get('action')
    object_type = request.query_params.get('object_type')
    days = request.query_params.get('days', 30)  # Ostatnie 30 dni domyślnie
    
    if user_id:
        logs = logs.filter(user_id=user_id)
    if action:
        logs = logs.filter(action=action)
    if object_type:
        logs = logs.filter(object_type=object_type)
    
    # Filtr czasowy
    try:
        days_int = int(days)
        start_date = timezone.now() - timedelta(days=days_int)
        logs = logs.filter(timestamp__gte=start_date)
    except ValueError:
        pass
    
    serializer = AuditLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def audit_log_by_object(request, object_type, object_id):
    """Historia zmian konkretnego obiektu"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Brak uprawnień'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    logs = AuditLog.objects.filter(object_type=object_type, object_id=object_id)
    serializer = AuditLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def audit_log_by_user(request, user_id):
    """Wszystkie akcje danego użytkownika"""
    if not request.user.is_staff and request.user.id != user_id:
        return Response(
            {'error': 'Brak uprawnień'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    logs = AuditLog.objects.filter(user_id=user_id)
    serializer = AuditLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def audit_log_statistics(request):
    """Statystyki audytu"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Brak uprawnień'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from django.db.models import Count
    
    stats = {
        'total_logs': AuditLog.objects.count(),
        'by_action': dict(AuditLog.objects.values('action').annotate(count=Count('id')).values_list('action', 'count')),
        'by_object_type': dict(AuditLog.objects.values('object_type').annotate(count=Count('id')).values_list('object_type', 'count')),
        'by_user': dict(AuditLog.objects.filter(user__isnull=False).values('user__username').annotate(count=Count('id')).values_list('user__username', 'count')),
    }
    
    return Response(stats)


@api_view(['POST'])
def create_audit_log(request):
    """Ręczne dodanie wpisu audytu (dla testów)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Brak uprawnień'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = AuditLogSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user, ip_address=get_client_ip(request))
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def get_client_ip(request):
    """Pobierz IP klienta z request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip