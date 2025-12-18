from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from court.models import User
from court.serializers import UserSerializer, UserUpdateSerializer, CustomTokenObtainPairSerializer, PasswordResetSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# --- 1. LOGOWANIE ---
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Niestandardowy widok logowania.
    """
    serializer_class = CustomTokenObtainPairSerializer

# --- NOWY ENDPOINT: RESET HASŁA ---
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Pozwala zresetować hasło użytkownikom (z wyłączeniem ADMIN i Superuser).
    Wymaga: username, email, new_password, confirm_password.
    """
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        email = serializer.validated_data['email']
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(username=username, email=email)
        except User.DoesNotExist:
            # Dla bezpieczeństwa można by zwracać ogólny błąd, ale tutaj chcemy pomóc userowi
            return Response(
                {"error": "Nie znaleziono użytkownika o podanym loginie i adresie e-mail."},
                status=status.HTTP_404_NOT_FOUND
            )

        # SPRAWDZENIE UPRAWNIEŃ (BLOKADA DLA ADMINÓW)
        is_admin_role = user.role and user.role.name.upper() == 'ADMIN'
        if user.is_superuser or is_admin_role:
            return Response(
                {"error": "Zmień w panelu admina!"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Zmiana hasła
        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Hasło zostało pomyślnie zmienione. Możesz się teraz zalogować."},
            status=status.HTTP_200_OK
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- 2. ZARZĄDZANIE UŻYTKOWNIKAMI ---

@api_view(['GET', 'POST'])
@permission_classes([AllowAny]) 
def user_list_create(request):
    """
    GET - listowanie użytkowników (z opcją filtrowania po roli)
    POST - rejestracja
    """
    if request.method == 'GET':
        queryset = User.objects.all()

        role_param = request.query_params.get('role', None)
        
        if role_param:
            queryset = queryset.filter(role__name__iexact=role_param)

        serializer = UserSerializer(queryset, many=True)
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

# Zwraca dane użytkownika
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    
    user = request.user
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone': getattr(user, 'phone', None),
        'date_joined': user.date_joined,
        'last_login': user.last_login,
        'is_active': user.is_active,
        'is_staff': user.is_staff,
        'role': user.role.name if hasattr(user, 'role') and user.role else None,
    }, status=status.HTTP_200_OK)