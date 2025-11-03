from rest_framework import serializers
from .models import Role
from .models import User
from .models import Case
from .models import Document

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']
        


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