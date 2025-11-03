from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from court.models import Message, ChatRoom
from court.serializers import MessageSerializer, ChatRoomSerializer


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
