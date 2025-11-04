from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from court.models import Message, ChatRoom
from court.serializers import MessageSerializer, ChatRoomSerializer
from court.models import User
from django.db.models import Q


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Pobierz info o bieżącym zalogowanym użytkowniku"""
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_rooms(request):
    """Pobierz wszystkie pokoje lub utwórz nowy"""
    if request.method == 'GET':
        rooms = ChatRoom.objects.all()
        serializer = ChatRoomSerializer(rooms, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ChatRoomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def chat_room_detail(request, pk):
    """Szczegóły pokoju, edycja lub usunięcie"""
    try:
        room = ChatRoom.objects.get(pk=pk)
    except ChatRoom.DoesNotExist:
        return Response({'error': 'Pokój nie istnieje'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ChatRoomSerializer(room)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ChatRoomSerializer(room, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        room.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def room_messages(request, pk):
    """Pobierz wiadomości z pokoju lub wyślij nową"""
    try:
        room = ChatRoom.objects.get(pk=pk)
    except ChatRoom.DoesNotExist:
        return Response({'error': 'Pokój nie istnieje'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        messages = room.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        data = request.data.copy()
        data['room'] = pk
        data['sender'] = request.user.id
        
        serializer = MessageSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def message_detail(request, pk):
    """Szczegóły wiadomości, edycja lub usunięcie"""
    try:
        message = Message.objects.get(pk=pk)
    except Message.DoesNotExist:
        return Response({'error': 'Wiadomość nie istnieje'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = MessageSerializer(message)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        if message.sender != request.user:
            return Response({'error': 'Nie możesz edytować cudzej wiadomości'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = MessageSerializer(message, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if message.sender != request.user:
            return Response({'error': 'Nie możesz usunąć cudzej wiadomości'}, status=status.HTTP_403_FORBIDDEN)
        
        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_as_read(request, pk):
    """Oznacz wiadomość jako przeczytaną"""
    try:
        message = Message.objects.get(pk=pk)
    except Message.DoesNotExist:
        return Response({'error': 'Wiadomość nie istnieje'}, status=status.HTTP_404_NOT_FOUND)
    
    message.is_read = True
    message.save()
    serializer = MessageSerializer(message)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def private_messages(request):
    """Pobierz wszystkie wiadomości prywatne lub wyślij nową"""
    
    if request.method == 'GET':
        # Pobierz recipient_id z query params
        recipient_id = request.query_params.get('recipient_id')
        
        if not recipient_id:
            return Response(
                {'error': 'Podaj recipient_id w query params'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Użytkownik nie istnieje'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Pobierz wiadomości między dwoma użytkownikami (w obie strony)
        messages = Message.objects.filter(
            Q(sender=request.user, recipient=recipient) |
            Q(sender=recipient, recipient=request.user),
            room__isnull=True  # Tylko wiadomości prywatne, nie z pokojów
        ).order_by('created_at')
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        recipient_id = request.data.get('recipient_id')
        content = request.data.get('content')
        
        if not recipient_id or not content:
            return Response(
                {'error': 'Podaj recipient_id i content'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Użytkownik nie istnieje'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Nie pozwalaj wysyłać wiadomości do siebie
        if recipient == request.user:
            return Response(
                {'error': 'Nie możesz wysłać wiadomości do siebie'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        message = Message.objects.create(
            sender=request.user,
            recipient=recipient,
            content=content,
            room=None  # Brak pokoju = wiadomość prywatna
        )
        
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def private_message_detail(request, pk):
    """Pobierz szczegóły wiadomości prywatnej"""
    try:
        message = Message.objects.get(pk=pk, room__isnull=True)
    except Message.DoesNotExist:
        return Response(
            {'error': 'Wiadomość nie istnieje'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = MessageSerializer(message)
    return Response(serializer.data)


@api_view(['DELETE', 'PUT'])
@permission_classes([IsAuthenticated])
def delete_private_message(request, pk):
    """Usuń lub edytuj swoją wiadomość prywatną"""
    try:
        message = Message.objects.get(pk=pk, room__isnull=True)
    except Message.DoesNotExist:
        return Response(
            {'error': 'Wiadomość nie istnieje'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Sprawdź czy to Twoja wiadomość
    if message.sender != request.user:
        return Response(
            {'error': 'Nie możesz edytować/usunąć cudzej wiadomości'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.method == 'DELETE':
        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    elif request.method == 'PUT':
        serializer = MessageSerializer(message, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_private_message_as_read(request, pk):
    """Oznacz wiadomość prywatną jako przeczytaną"""
    try:
        message = Message.objects.get(pk=pk, room__isnull=True)
    except Message.DoesNotExist:
        return Response(
            {'error': 'Wiadomość nie istnieje'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Tylko odbiorca może oznaczyć jako przeczytaną
    if message.recipient != request.user:
        return Response(
            {'error': 'Tylko odbiorca może oznaczyć wiadomość jako przeczytaną'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    message.is_read = True
    message.save()
    
    serializer = MessageSerializer(message)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_message_count(request):
    """Pobierz liczbę nieprzeczytanych wiadomości"""
    unread_count = Message.objects.filter(
        recipient=request.user,
        is_read=False,
        room__isnull=True
    ).count()
    
    return Response({'unread_count': unread_count})
