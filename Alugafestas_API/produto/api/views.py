from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter
from itertools import chain

# Importe seus models e serializers
from produto.models import Categoria, Produto, Kit
from .serializers import CategoriaSerializer, ProdutoSerializer, KitSerializer

# --- Paginação Personalizada ---
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 28
    page_size_query_param = 'page_size'
    max_page_size = 100

# --- Categoria ---
@extend_schema(tags=['Categorias'])
class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all().order_by('nome')
    serializer_class = CategoriaSerializer
    # GET é público, mas POST/PUT/DELETE exige login
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# --- Produto e Busca Unificada ---
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
@extend_schema(tags=['Kits'])
class KitViewSet(viewsets.ModelViewSet):
    # Otimização essencial: busca itens e produtos aninhados para o Serializer não fazer N+1 queries
    queryset = Kit.objects.select_related('categoria').prefetch_related(
        'itens__produto__imagens_carrossel',
        'itens__produto'
    ).order_by('-id')
    
    serializer_class = KitSerializer
    pagination_class = StandardResultsSetPagination
    # GET é público, alterações exigem login
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        destaque = self.request.query_params.get('destaque')
        if destaque == 'true':
            queryset = queryset.filter(destaque=True)
        return queryset