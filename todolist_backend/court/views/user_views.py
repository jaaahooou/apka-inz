from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from court.models import User
from court.serializers import UserSerializer, UserUpdateSerializer



@api_view(['GET', 'POST'])
def user_list_create(request):
    """
    GET - listowanie wszystkich użytkowników
    POST - tworzenie nowego użytkownika
    """
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def user_detail(request, pk):
    """
    GET - pobieranie szczegółów pojedynczego użytkownika
    """
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(
            {"error": "Użytkownik nie został znaleziony"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
def user_update(request, pk):
    """
    PUT - pełna aktualizacja użytkownika (tylko role, phone, email)
    PATCH - częściowa aktualizacja użytkownika (tylko role, phone, email)
    """
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(
            {"error": "Użytkownik nie został znaleziony"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Ustawiamy partial=True dla PATCH, aby umożliwić częściową aktualizację
    partial = request.method == 'PATCH'
    serializer = UserUpdateSerializer(user, data=request.data, partial=partial)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def user_delete(request, pk):
    """
    DELETE - usuwanie użytkownika
    """
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(
            {"error": "Użytkownik nie został znaleziony"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    user.delete()
    return Response(
        {"message": "Użytkownik został pomyślnie usunięty"},
        status=status.HTTP_204_NO_CONTENT
    )
