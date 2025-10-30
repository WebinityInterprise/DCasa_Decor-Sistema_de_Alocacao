from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from contas.api.serializers import AdminLoginSerializer, AdminCreateSerializer, AdminProfileSerializer
from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.generics import RetrieveUpdateAPIView 
class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Login do administrador",
        description="Login usando email e senha. Retorna tokens JWT.",
        request=AdminLoginSerializer,
        responses={
            200: {
                "type": "object",
                "properties": {
                    "refresh": {"type": "string"},
                    "access": {"type": "string"},
                    "email": {"type": "string"},
                    "user_id": {"type": "integer"},
                    "first_name": {"type": "string"},
                    "last_name": {"type": "string"}
                }
            }
        }
    )
    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        if serializer.is_valid():
            # Pega os dados validados do serializer
            validated_data = serializer.validated_data
            
            return Response({
                'refresh': validated_data.get('refresh'),
                'access': validated_data.get('access'),
                'email': validated_data['user'].email,
                'user_id': validated_data['user'].id,
                'first_name': validated_data['user'].first_name,
                'last_name': validated_data['user'].last_name
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminCreateView(APIView):
    permission_classes = [AllowAny]  # Apenas admins podem criar outros admins
    
    @extend_schema(
        summary="Criar novo administrador",
        description="Cria um novo usuário administrador. Requer autenticação de admin.",
        request=AdminCreateSerializer,
        responses={
            201: {
                "type": "object", 
                "properties": {
                    "message": {"type": "string"},
                    "email": {"type": "string"},
                    "user_id": {"type": "integer"}
                }
            }
        }
    )
    def post(self, request):
        serializer = AdminCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Administrador criado com sucesso",
                "email": user.email,
                "user_id": user.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AdminTokenRefreshView(TokenRefreshView):
    """
    View para refresh do token JWT
    Permite que qualquer pessoa tente refresh (não requer autenticação)
    """
    permission_classes = [AllowAny]
    
    
class AdminPerfilView(RetrieveUpdateAPIView):
    serializer_class = AdminProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self):
        return self.request.user

    @extend_schema(
        summary="Obter perfil do administrador",
        description="Retorna os dados do administrador logado.",
        responses={200: AdminProfileSerializer}
    )
    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Atualizar perfil do administrador",
        description="Atualiza dados do administrador (nome, email, senha).",
        request=AdminProfileSerializer,
        responses={200: AdminProfileSerializer}
    )
    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    @extend_schema(
        summary="Atualizar perfil parcialmente",
        description="Atualiza dados parciais do administrador.",
        request=AdminProfileSerializer,
        responses={200: AdminProfileSerializer}
    )
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)