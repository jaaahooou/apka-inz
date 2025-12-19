from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from court.models import Notification
from court.serializers import NotificationSerializer
from django.utils import timezone

@api_view(['GET'])
def notification_list(request):
    """Lista powiadomień zalogowanego użytkownika"""
    notifications = Notification.objects.filter(user=request.user).order_by('-sent_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def notification_unread_count(request):
    """Liczba nieprzeczytanych powiadomień"""
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({'unread_count': count})

@api_view(['PUT'])
def mark_notification_as_read(request, pk):
    """Oznacz powiadomienie jako przeczytane"""
    try:
        notification = Notification.objects.get(pk=pk, user=request.user)
        notification.mark_as_read()
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Powiadomienie nie znalezione'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['PUT'])
def mark_all_notifications_as_read(request):
    """Oznacz wszystkie powiadomienia jako przeczytane"""
    notifications = Notification.objects.filter(user=request.user, is_read=False)
    count = notifications.update(is_read=True, read_at=timezone.now())
    return Response({'marked_as_read': count}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def notification_delete(request, pk):
    """Usuń konkretne powiadomienie"""
    try:
        notification = Notification.objects.get(pk=pk, user=request.user)
        notification.delete()
        return Response({'message': 'Powiadomienie usunięte'}, status=status.HTTP_204_NO_CONTENT)
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Powiadomienie nie znalezione'},
            status=status.HTTP_404_NOT_FOUND
        )