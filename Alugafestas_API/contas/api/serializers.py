from rest_framework import serializers
from django.contrib.auth.models import User
from contas.models import UserAdmin
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password 


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
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Usuário não encontrado.")

        # Verifica se o usuário é staff (administrador)
        if not user.is_staff:
            raise serializers.ValidationError("Acesso permitido apenas para administradores.")

        # Autentica com username
        user = authenticate(username=user.username, password=password)
        if not user:
            raise serializers.ValidationError("Credenciais inválidas.")

        # Gera tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Adiciona os tokens ao validated_data
        data['user'] = user
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        return data
    
    
class AdminProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    senha_atual = serializers.CharField(
        write_only=True, 
        required=False, 
        help_text="Necessária para alterar senha ou email"
    )
    nova_senha = serializers.CharField(
        write_only=True, 
        required=False, 
        min_length=6, 
        help_text="Nova senha (opcional)"
    )
    confirmar_senha = serializers.CharField(
        write_only=True, 
        required=False, 
        help_text="Confirmação da nova senha"
    )

    class Meta:
        model = User
        fields = [
            'id', 
            'email', 
            'first_name', 
            'last_name', 
            'senha_atual', 
            'nova_senha', 
            'confirmar_senha'
        ]
        read_only_fields = ['id']

    def validate_email(self, value):
        usuario = self.context['request'].user
        if User.objects.filter(email=value).exclude(id=usuario.id).exists():
            raise serializers.ValidationError("Este e-mail já está em uso por outro usuário.")
        return value

    def validate(self, attrs):
        # Validação de senha
        nova_senha = attrs.get('nova_senha')
        confirmar_senha = attrs.get('confirmar_senha')
        senha_atual = attrs.get('senha_atual')

        if nova_senha and not confirmar_senha:
            raise serializers.ValidationError({"confirmar_senha": "Confirme a nova senha."})

        if nova_senha and confirmar_senha and nova_senha != confirmar_senha:
            raise serializers.ValidationError({"confirmar_senha": "As senhas não coincidem."})

        # Se está tentando alterar senha ou email, verifica a senha atual
        usuario = self.context['request'].user
        if (nova_senha or attrs.get('email') != usuario.email) and not senha_atual:
            raise serializers.ValidationError({"senha_atual": "Senha atual é necessária para fazer alterações."})

        if senha_atual and not usuario.check_password(senha_atual):
            raise serializers.ValidationError({"senha_atual": "Senha atual incorreta."})

        # Valida a nova senha
        if nova_senha:
            try:
                validate_password(nova_senha, usuario)
            except serializers.ValidationError as e:
                raise serializers.ValidationError({"nova_senha": list(e.messages)})

        return attrs

    def update(self, instance, validated_data):
        # Remove campos que não são do model User
        validated_data.pop('senha_atual', None)
        validated_data.pop('confirmar_senha', None)
        nova_senha = validated_data.pop('nova_senha', None)

        # Atualiza email (também atualiza username)
        if 'email' in validated_data:
            instance.username = validated_data['email']
        
        # Atualiza outros campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Atualiza senha se fornecida
        if nova_senha:
            instance.set_password(nova_senha)

        instance.save()
        return instance