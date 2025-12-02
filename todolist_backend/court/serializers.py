from rest_framework import serializers
from .models import Role
from .models import User
from .models import Case
from .models import Document
from .models import Hearing
from .models import Notification
from .models import CaseParticipant
from .models import AuditLog
from .models import Message, ChatRoom
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate 
from rest_framework.exceptions import AuthenticationFailed

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']
        


class UserSerializer(serializers.ModelSerializer):
    """
    Główny serializer dla modelu User - do odczytu i tworzenia
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = ['created_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        # Użyj create_user, aby zahashować hasło
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        
        # Dodaj pozostałe pola
        user.role = validated_data.get('role')
        user.phone = validated_data.get('phone', '')
        user.status = validated_data.get('status', '')
        
        # --- NAPRAWA: Pobierz is_active z danych (jeśli przesłaliśmy False, to użyj False) ---
        user.is_active = validated_data.get('is_active', True) 
        
        user.save()
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer do aktualizacji - pozwala edytować tylko role, phone i email
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 
                  'role', 'phone', 'status', 'created_at']
        read_only_fields = ['id', 'username', 'first_name', 'last_name', 
                           'status', 'created_at']
        

class CaseSerializer(serializers.ModelSerializer):
    """
    Serializer dla modelu Case
    """
    # Dodatkowe pole tylko do odczytu - pokazuje username twórcy
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    
    class Meta:
        model = Case
        fields = ['id', 'case_number', 'title', 'description', 'status', 
                  'creator', 'creator_username', 'created_at']
        read_only_fields = ['id', 'creator', 'created_at']
        
        
class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'file', 'file_url', 'case', 
                  'uploaded_by', 'uploaded_by_username', 'uploaded_at', 'file_size']
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at', 'file_size']
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None
    
class HearingSerializer(serializers.ModelSerializer):
    judge_username = serializers.CharField(source='judge.username', read_only=True)
    case_number = serializers.CharField(source='case.case_number', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Hearing
        fields = ['id', 'case', 'case_number', 'date_time', 'location', 'status', 
                  'status_display', 'judge', 'judge_username', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']
        
class NotificationSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True, required=False)
    case_number = serializers.CharField(source='case.case_number', read_only=True, required=False)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'user_username', 'title', 'message', 
            'notification_type', 'is_read', 'read_at', 'case', 'case_number',
            'hearing', 'document', 'sender', 'sender_username', 'sent_at'
        ]
        read_only_fields = ['id', 'sent_at', 'read_at']
        
class CaseParticipantSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_in_case_display', read_only=True)
    case_number = serializers.CharField(source='case.case_number', read_only=True)
    
    class Meta:
        model = CaseParticipant
        fields = [
            'id', 'case', 'case_number', 'user', 'user_username', 'user_full_name',
            'role_in_case', 'role_display', 'description', 'is_active',
            'joined_at', 'left_at', 'contact_email', 'contact_phone'
        ]
        read_only_fields = ['id', 'joined_at']
    
    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
class AuditLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True, required=False)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    object_type_display = serializers.CharField(source='get_object_type_display', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_username', 'action', 'action_display',
            'object_type', 'object_type_display', 'object_id', 'object_name',
            'description', 'old_value', 'new_value', 'ip_address', 'user_agent',
            'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']
        

#Chatroom serializer
class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)  # ✅ IntegerField zamiast CharField
    recipient_username = serializers.CharField(source='recipient.username', read_only=True, allow_null=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 
            'sender', 
            'sender_id',  # Teraz będzie number, nie string
            'sender_username', 
            'recipient', 
            'recipient_username',
            'content', 
            'created_at', 
            'is_read',
            'room'
        ]
        read_only_fields = ['created_at', 'sender', 'sender_id', 'sender_username', 'recipient_username']

class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'created_at', 'messages']


class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'created_at', 'messages']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        # KROK 1: Sprawdźmy ręcznie, czy użytkownik w ogóle istnieje
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            # Jeśli nie ma takiego loginu -> Błąd danych
            raise AuthenticationFailed("INVALID_CREDENTIALS")

        # KROK 2: Sprawdźmy hasło (niezależnie od tego czy aktywny)
        if not user.check_password(password):
            # Jeśli złe hasło -> Błąd danych
            raise AuthenticationFailed("INVALID_CREDENTIALS")

        # KROK 3: Skoro login i hasło są OK, to teraz sprawdzamy czy AKTYWNY
        if not user.is_active:
            # Login/hasło super, ale konto zablokowane -> Specjalny błąd
            raise AuthenticationFailed("ACCOUNT_DISABLED")

        # KROK 4: Jeśli wszystko OK, generujemy token
        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = str(user.role)
        token['username'] = user.username
        return token