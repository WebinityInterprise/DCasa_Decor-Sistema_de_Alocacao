from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter
from itertools import chain
from drf_spectacular.utils import extend_schema, OpenApiParameter, extend_schema_view, OpenApiExample
# Importe seus models e serializers
from produto.models import Categoria, Produto, Kit, Evento, EventoItem
from .serializers import CategoriaSerializer, ProdutoSerializer, KitSerializer, EventoSerializer, EventoItemSerializer, BannerSerializer, Banner
from rest_framework.parsers import MultiPartParser, FormParser
# --- Paginação Personalizada ---
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 28
    page_size_query_param = 'page_size'
    max_page_size = 100

# --- Categoria ---
@extend_schema_view(
    create=extend_schema(
        summary="Criar Categoria (JSON)",
        description="Cria uma categoria enviando a imagem como string Base64.",
        examples=[
            OpenApiExample(
                name='Exemplo Categoria Base64',
                summary='Cadastro via JSON Puro',
                description='Exemplo enviando imagem codificada em Base64.',
                value={
                    "nome": "Casamento Clássico",
                    "slug": "casamento-classico-2024",
                    "descricao": "Itens sofisticados para casamentos tradicionais.",
                    # String Base64 real (encurtada para exemplo)
                    "imagem": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
                    "destaque": True
                },
                request_only=True
            )
        ]
    )
)
@extend_schema(tags=['Categorias'])
class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all().order_by('nome')
    serializer_class = CategoriaSerializer
    # GET é público, mas POST/PUT/DELETE exige login
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# --- Produto e Busca Unificada ---
@extend_schema_view(
    create=extend_schema(
        summary="Criar Produto (JSON Puro)",
        description="Cria um produto enviando imagens (capa e carrossel) como Base64.",
        examples=[
            OpenApiExample(
                name='Exemplo Produto Completo JSON',
                summary='Produto com Múltiplas Imagens',
                description='Exemplo enviando capa e uma lista de fotos extras via JSON.',
                value={
                    "nome": "Mesa Rústica de Madeira",
                    "codigo": "MOV015",
                    "categoria_id": 4,
                    "descricao": "Mesa de madeira maciça para 8 lugares.",
                    "preco": 150.00,
                    "cor": "Madeira",
                    "quantidade_estoque": 10,
                    "destaque": True,
                    "disponivel": True,
                    # Imagem de Capa (Base64)
                    "imagem": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE...", 
                    # Lista de Imagens Extras (Base64)
                    "upload_imagens_carrossel": [
                        "data:image/jpeg;base64,/9j/4AAQSkZJRgAB...",
                        "data:image/png;base64,iVBORw0KGgoAAA..."
                    ]
                },
                request_only=True
            )
        ]
    )
)
@extend_schema(tags=['Produtos'])
class ProdutoViewSet(viewsets.ModelViewSet):
    # Otimização: Carrega categoria e imagens junto para evitar N+1 queries
    queryset = Produto.objects.all().select_related('categoria').prefetch_related('imagens_carrossel').order_by('id')
    serializer_class = ProdutoSerializer
    pagination_class = StandardResultsSetPagination
   
    # GET é público, alterações exigem login
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='q', description='Busca por nome, código ou categoria', required=False, type=str),
            OpenApiParameter(name='cor', description='Filtra produtos por cor', required=False, type=str),
            OpenApiParameter(name='preco_max', description='Preço máximo', required=False, type=float),
            OpenApiParameter(name='categoria', description='Filtra por categoria (ex: Kits Prontos, Vasos)', required=False, type=str),
            OpenApiParameter(name='page', description='Número da página', required=False, type=int),
        ],
        description="Busca unificada: Retorna tanto PRODUTOS quanto KITS que correspondam aos filtros.",
        tags=['Produtos']
    )
    @action(detail=False, methods=['get'])
    def busca_produto(self, request):
        # 1. Captura parâmetros
        query = request.query_params.get('q')
        cor = request.query_params.get('cor')
        preco_max = request.query_params.get('preco_max')
        categoria = request.query_params.get('categoria')

        # ---------------------------------------------------
        # 2. Filtra PRODUTOS
        # ---------------------------------------------------
        # Otimização aqui também
        produtos = Produto.objects.select_related('categoria').prefetch_related('imagens_carrossel').order_by('id')

        if query:
            produtos = produtos.filter(
                Q(nome__icontains=query) | 
                Q(categoria__nome__icontains=query) |
                Q(codigo__icontains=query)
            )
        if cor and cor != "Todas":
            produtos = produtos.filter(cor__iexact=cor)
        if preco_max:
            produtos = produtos.filter(preco__lte=preco_max)
        if categoria and categoria != "Todas":
            produtos = produtos.filter(categoria__nome__iexact=categoria)

        # ---------------------------------------------------
        # 3. Filtra KITS
        # ---------------------------------------------------
        kits = Kit.objects.none()
        
        # Só busca Kits se a cor não for especificada (pois Kit não tem filtro de cor direto no model principal)
        if not cor or cor == "Todas":
            # Otimização: Carrega itens, produtos dentro dos itens e imagens desses produtos
            kits = Kit.objects.prefetch_related(
                'itens__produto__imagens_carrossel', # Para o carrossel do item funcionar
                'itens__produto'
            ).select_related('categoria').order_by('id')
            
            if query:
                kits = kits.filter(
                    Q(nome__icontains=query) |
                    Q(categoria__nome__icontains=query) |
                    Q(codigo__icontains=query)
                )
            if preco_max:
                kits = kits.filter(preco__lte=preco_max)
            if categoria and categoria != "Todas":
                kits = kits.filter(categoria__nome__iexact=categoria)

        # ---------------------------------------------------
        # 4. Serializa e Marca o Tipo
        # ---------------------------------------------------
        # Serializamos usando os Serializers novos que suportam a estrutura atualizada
        produtos_data = ProdutoSerializer(produtos, many=True, context={'request': request}).data
        for p in produtos_data:
            p['tipo'] = 'produto' # Frontend usa isso para rota /produto/:id

        kits_data = KitSerializer(kits, many=True, context={'request': request}).data
        for k in kits_data:
            k['tipo'] = 'kit'     # Frontend usa isso para rota /KitDetalhes/:id

        # ---------------------------------------------------
        # 5. Combina e Pagina Manualmente
        # ---------------------------------------------------
        resultados_combinados = produtos_data + kits_data
        
        # Paginação manual sobre a lista combinada
        paginator = StandardResultsSetPagination()
        page_size = paginator.page_size
        
        try:
            page_number = int(request.query_params.get('page', 1))
        except ValueError:
            page_number = 1

        start_index = (page_number - 1) * page_size
        end_index = start_index + page_size
        
        pagina_atual = resultados_combinados[start_index:end_index]
        count = len(resultados_combinados)

        return Response({
            "count": count,
            "next": f"?page={page_number + 1}" if end_index < count else None,
            "previous": f"?page={page_number - 1}" if page_number > 1 else None,
            "results": pagina_atual
        })

# --- Kit (View Normal) ---
@extend_schema(
    tags=['Kits'],
    summary="Criar Kit (JSON Puro)",
    description="Cria um kit enviando a imagem em Base64 e os itens como lista JSON.",
    examples=[
        OpenApiExample(
            name='Exemplo JSON Puro',
            value={
                "nome": "Kit Festa Completa",
                "codigo": "KIT099",
                "categoria_id": 1,
                "descricao": "Kit via JSON",
                "preco": 150.00,
                "destaque": True,
                # Imagem reduzida para exemplo (envie a string completa do base64)
                "imagem": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                "itens_input": [
                    {"produto_id": 1, "quantidade": 10},
                    {"produto_id": 2, "quantidade": 5}
                ]
            },
            request_only=True
        )
    ]
)
@extend_schema(tags=['Kits'])
class KitViewSet(viewsets.ModelViewSet):
    # Otimização: busca itens e produtos aninhados
    queryset = Kit.objects.select_related('categoria').prefetch_related(
        'itens__produto__imagens_carrossel',
        'itens__produto'
    ).order_by('-id')
    
    serializer_class = KitSerializer
    pagination_class = StandardResultsSetPagination
    
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        destaque = self.request.query_params.get('destaque')
        if destaque == 'true':
            queryset = queryset.filter(destaque=True)
        return queryset

@extend_schema_view(
    create=extend_schema(
        summary="Criar Evento (JSON Puro)",
        description="Cria um evento completo com imagem (Base64) e lista de produtos.",
        examples=[
            OpenApiExample(
                name='Exemplo Evento Completo',
                summary='Cadastro via JSON',
                description='Exemplo de cadastro de um Casamento com itens inclusos.',
                value={
                    "nome": "Casamento ao Ar Livre",
                    "codigo": "EVT2024",
                    "tipo": "casamento", # Deve corresponder ao CHOICE do model (ex: casamento, aniversario)
                    "descricao": "Pacote completo para cerimônia no jardim.",
                    "capacidade_pessoas": 150,
                    "destaque": True,
                    "preco": 5000.00, # Se for calculado automaticamente, pode omitir ou enviar 0
                    # Imagem Base64 (exemplo encurtado)
                    "imagem": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
                    "itens_input": [
                        {"produto_id": 10, "quantidade": 150}, # Ex: 150 Cadeiras
                        {"produto_id": 22, "quantidade": 15}   # Ex: 15 Mesas
                    ]
                },
                request_only=True
            )
        ]
    )
)
@extend_schema(tags=['Eventos'])
class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.prefetch_related('itens_evento__produto__imagens_carrossel', 'itens_evento__produto').order_by('-id')
    serializer_class = EventoSerializer
    pagination_class = StandardResultsSetPagination
    # GET é público. POST, PUT, DELETE exige login.
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get('destaque') == 'true':
            qs = qs.filter(destaque=True)
        if tipo := self.request.query_params.get('tipo'):
            qs = qs.filter(tipo__iexact=tipo)
        return qs
    
    
# --- Banners (Carrossel) ---
@extend_schema_view(
    create=extend_schema(
        summary="Criar Banner (JSON)",
        description="Cria um banner para o carrossel enviando a imagem como string Base64.",
        examples=[
            OpenApiExample(
                name='Exemplo Banner Base64',
                summary='Cadastro de Banner',
                description='Banner para a página inicial.',
                value={
                    "titulo": "Promoção de Primavera",
                    "ativo": True,
                    "ordem": 1,
                    # String Base64 encurtada
                    "imagem": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."
                },
                request_only=True
            )
        ]
    )
)
@extend_schema(tags=['Banners'])
class BannerViewSet(viewsets.ModelViewSet):
    # Filtra apenas os ativos e ordena pela ordem definida
    queryset = Banner.objects.filter(ativo=True).order_by('ordem')
    serializer_class = BannerSerializer
    
    # IMPORTANTE: GET é público (AllowAny implícito no ReadOnly), 
    # mas POST/PUT/DELETE exige token (IsAuthenticated).
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    # Para o carrossel, removemos a paginação para vir uma lista direta [{}, {}]
    pagination_class = None