from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from court.models import User
from court.serializers import UserSerializer, UserUpdateSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from court.serializers import CustomTokenObtainPairSerializer

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def user_list_create(request):
    """
    GET - listowanie wszystkich użytkowników
    POST - tworzenie nowego użytkownika
    """
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Brak dostępu. Musisz być zalogowany, aby widzieć listę."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(is_active=False)
            return Response({
                "message": "Konto utworzone pomyślnie. Poczekaj na aktywację przez Administratora.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
            
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
    PUT - pełna aktualizacja użytkownika
    PATCH - częściowa aktualizacja użytkownika
    """
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(
            {"error": "Użytkownik nie został znaleziony"},
            status=status.HTTP_404_NOT_FOUND
        )
    
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

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Niestandardowy widok logowania, który pozwala rozróżnić
    błąd hasła od błędu nieaktywnego konta.
    """
    serializer_class = CustomTokenObtainPairSerializer