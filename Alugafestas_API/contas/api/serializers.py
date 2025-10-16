from rest_framework import serializers
from django.contrib.auth.models import User
from contas.models import UserAdmin
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

class AdminCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado.")
        return value

    def create(self, validated_data):
        # Usamos email como username
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_staff=True  # usuário administrativo
        )
        return user
class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(help_text="Email do administrador cadastrado")
    password = serializers.CharField(write_only=True, help_text="Senha do administrador")
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
    # verificar se tem email cadastrado
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Usuário não encontrado.")

        # Autentica com username (Django usa 'username' internamente)
        user = authenticate(username=user.username, password=password)
        if not user:
            raise serializers.ValidationError("Credenciais inválidas.")

        data['user'] = user
        return data
    