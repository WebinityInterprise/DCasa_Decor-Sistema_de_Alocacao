from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from contas.api.serializers import AdminLoginSerializer, AdminCreateSerializer
from drf_spectacular.utils import extend_schema

class AdminLoginVIew(APIView):  # ✅ Nome corrigido
    @extend_schema(
        summary="Login do administrador",
        description="Login usando email e senha.",
        request=AdminLoginSerializer,  # Puxa diretamente os campos do serializer
        responses={200: AdminLoginSerializer}  # opcional
    )
    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']  # ✅ Corrigido

            # cria um token de acesso
            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                'token': token.key,
                'email': user.email
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class AdminCreateView(APIView):
    def post(self, request):
        serializer = AdminCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Administrador criado com sucesso",
                "email": user.email,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)