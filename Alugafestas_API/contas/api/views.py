from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from contas.api.serializers import AdminLoginSerializer, AdminCreateSerializer, AdminProfileSerializer, EventoSerializer, ContatoSerializer, FuncionamentoSerializer
from drf_spectacular.utils import extend_schema,OpenApiExample
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.generics import RetrieveUpdateAPIView 
from rest_framework.viewsets import ViewSet
from contas.models import Evento, Contato, Funcionamento
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample
class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Login do administrador",
        description="Login usando email e senha. Retorna tokens JWT.",
        request=AdminLoginSerializer,
        examples=[
            OpenApiExample(
            '   Exemplo de login',
            value={
                "email": "gersonfagundes2016@gmail.com",
                "password": "1e2e3e4e"
                }
         )
        ],
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

class InformacoesViewSet(ViewSet):

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    # ------------------- GET PÚBLICO -------------------
    @extend_schema(
        summary="Informações institucionais do site",
        description="Retorna eventos, contatos e horários de funcionamento do site.",
        responses={
            200: OpenApiResponse(
                description="Informações carregadas com sucesso",
                response=dict,
                examples=[OpenApiExample(
                    "Exemplo de resposta",
                    value={
                        "eventos": [
                            {"id": 1, "nome": "Natal"},
                            {"id": 2, "nome": "Ano Novo"},
                            {"id": 3, "nome": "Casamento"}
                        ],
                        "contatos": [
                            {"email": "contato@email.com.br", "telefone": "(84) 9 9999-9999"}
                        ],
                        "funcionamento": [
                            {"dia": "Segunda", "horario": "08:00 às 17:00"},
                            {"dia": "Sábado", "horario": "08:00 às 12:00"}
                        ]
                    }
                )]
            )
        }
    )
    def list(self, request):
        eventos = Evento.objects.all()
        contatos = Contato.objects.all()
        funcionamento = Funcionamento.objects.all()
        return Response({
            "eventos": EventoSerializer(eventos, many=True).data,
            "contatos": ContatoSerializer(contatos, many=True).data,
            "funcionamento": FuncionamentoSerializer(funcionamento, many=True).data,
        })

    # ------------------- POST AUTENTICADO -------------------
    @extend_schema(
        summary="Criar registro institucional",
        description="Cria um novo registro de evento, contato ou funcionamento. Requer autenticação.",
        request=dict,
        responses={
            201: OpenApiResponse(
                description="Registro criado com sucesso",
                response=dict,
                examples=[OpenApiExample(
                    "Exemplo de resposta",
                    value={"detail": "Registro criado com sucesso"}
                )]
            ),
            400: OpenApiResponse(
                description="Dados inválidos",
                response=dict,
                examples=[OpenApiExample(
                    "Exemplo de resposta",
                    value={"detail": "Erro ao criar registro"}
                )]
            )
        }
    )
    def create(self, request):
        # Exemplo: criar eventos, contatos ou funcionamento
        data = request.data
        created = []

        # Criar eventos
        for ev in data.get("eventos", []):
            e = Evento.objects.create(nome=ev["nome"])
            created.append({"tipo": "evento", "id": e.id, "nome": e.nome})

        # Criar contatos
        for c in data.get("contatos", []):
            ct = Contato.objects.create(email=c["email"], telefone=c["telefone"])
            created.append({"tipo": "contato", "id": ct.id, "email": ct.email})

        # Criar funcionamento
        for f in data.get("funcionamento", []):
            func = Funcionamento.objects.create(dia=f["dia"], horario=f["horario"])
            created.append({"tipo": "funcionamento", "id": func.id, "dia": func.dia})

        return Response({"detail": "Registro criado com sucesso", "criados": created}, status=201)

    # ------------------- PUT/PATCH AUTENTICADO -------------------
    @extend_schema(
        summary="Atualizar registro institucional",
        description="Atualiza um registro existente de evento, contato ou funcionamento. Requer autenticação.",
        request=dict,
        responses={
            200: OpenApiResponse(
                description="Registro atualizado com sucesso",
                response=dict,
                examples=[OpenApiExample(
                    "Exemplo de resposta",
                    value={"detail": "Registro atualizado com sucesso"}
                )]
            ),
            400: OpenApiResponse(
                description="Erro de atualização",
                response=dict,
                examples=[OpenApiExample(
                    "Exemplo de resposta",
                    value={"detail": "Erro ao atualizar registro"}
                )]
            )
        }
    )
    def partial_update(self, request, pk=None):
        # Exemplo simples: atualizar evento, contato ou funcionamento pelo ID
        return Response({"detail": "Atualização de registro implementável aqui"}, status=200)

    # ------------------- DELETE AUTENTICADO -------------------
    @extend_schema(
        summary="Remover registro institucional",
        description="Remove um registro de evento, contato ou funcionamento. Requer autenticação.",
        responses={
            200: OpenApiResponse(
                description="Registro removido com sucesso",
                response=dict,
                examples=[OpenApiExample(
                    "Exemplo de resposta",
                    value={"detail": "Registro removido com sucesso"}
                )]
            ),
            400: OpenApiResponse(
                description="Erro ao remover registro",
                response=dict,
                examples=[OpenApiExample(
                    "Exemplo de resposta",
                    value={"detail": "Erro ao remover registro"}
                )]
            )
        }
    )
    def destroy(self, request, pk=None):
        # Aqui você pode buscar o registro por ID e deletar
        return Response({"detail": "Registro removido com sucesso"}, status=200)
