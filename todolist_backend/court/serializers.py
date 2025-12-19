from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from .models import Role, User, Case, Document, Hearing, Notification, CaseParticipant, AuditLog, Message, ChatRoom, CaseParty

# --- 1. LOGOWANIE I TOKENY ---

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise AuthenticationFailed("INVALID_CREDENTIALS")

        if not user.check_password(password):
            raise AuthenticationFailed("INVALID_CREDENTIALS")

        if not user.is_active:
            raise AuthenticationFailed("ACCOUNT_DISABLED")

        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = str(user.role) if user.role else ""
        token['username'] = user.username
        token['user_id'] = user.id
        # USUNIĘTO: token['theme'] = user.theme
        return token

class PasswordResetSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Podane hasła nie są identyczne."})
        return data

# --- NOWY SERIALIZER: ZMIANA HASŁA (DLA ZALOGOWANYCH) ---
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"new_password": "Hasła nie są identyczne."})
        return data

# --- 2. UŻYTKOWNIK I ROLE ---
class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    # DODANO: Pole is_online wyliczane dynamicznie z uwzględnieniem is_visible
    is_online = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = ['date_joined'] 
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def get_is_online(self, obj):
        # Użytkownik jest online tylko jeśli ma połączenie WS ORAZ chce być widoczny
        return obj.is_online and obj.is_visible

    def create(self, validated_data):
        is_active = validated_data.get('is_active', True)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        user.role = validated_data.get('role')
        user.phone = validated_data.get('phone', '')
        user.status = validated_data.get('status', '')
        user.is_active = is_active
        user.is_visible = validated_data.get('is_visible', True)
        user.save()
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 
                  'role', 'phone', 'status', 'date_joined', 'is_active', 'is_visible']
        read_only_fields = ['id', 'username', 'date_joined'] 

# --- 3. SPRAWY I DOKUMENTY ---

class CasePartySerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseParty
        fields = ['id', 'name', 'role']

class CaseSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    assigned_judge_username = serializers.CharField(source='assigned_judge.username', read_only=True)
    
    parties = CasePartySerializer(many=True, required=False) 

    class Meta:
        model = Case
        fields = ['id', 'case_number', 'title', 'description', 'status', 
                  'creator', 'creator_username', 'assigned_judge', 'assigned_judge_username', 
                  'created_at', 'filing_date', 'category', 'value_amount', 'parties']
        read_only_fields = ['id', 'creator', 'created_at']

    def create(self, validated_data):
        parties_data = validated_data.pop('parties', []) 
        case = Case.objects.create(**validated_data)
        
        for party in parties_data:
            CaseParty.objects.create(case=case, **party)
            
        return case

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
        if obj.user.first_name or obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return obj.user.username

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

# --- 4. KOMUNIKATOR ---
class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_id = serializers.IntegerField(source='sender.id', read_only=True) 
    recipient_username = serializers.CharField(source='recipient.username', read_only=True, allow_null=True)
    attachment_url = serializers.SerializerMethodField() 

    class Meta:
        model = Message
        fields = [
            'id', 
            'sender', 
            'sender_id', 
            'sender_username', 
            'recipient', 
            'recipient_username',
            'content', 
            'attachment',      
            'attachment_url',  
            'created_at', 
            'is_read',
            'room'
        ]
        read_only_fields = ['created_at', 'sender', 'sender_id', 'sender_username', 'recipient_username']

    def get_attachment_url(self, obj):
        request = self.context.get('request')
        if obj.attachment and request:
            return request.build_absolute_uri(obj.attachment.url)
        return None
    
class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'created_at', 'messages']