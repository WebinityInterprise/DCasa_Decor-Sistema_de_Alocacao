from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter
from produto.models import Categoria, Produto, Kit
from .serializers import CategoriaSerializer, ProdutoSerializer, KitSerializer
from itertools import chain

# --- Paginação Personalizada ---
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 28
    page_size_query_param = 'page_size'
    max_page_size = 100

# --- Categoria ---
@extend_schema(tags=['Categorias'])
class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = []

# --- Produto e Busca Unificada ---
@extend_schema(tags=['Produtos'])
class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all().order_by('id')
    serializer_class = ProdutoSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = []

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
        produtos = Produto.objects.all().order_by('id')

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
        # Se o usuário filtrou por COR, geralmente não mostramos Kits 
        # (a menos que Kit tenha cor, mas no seu model não tem).
        # Então só buscamos kits se a cor for "Todas" ou não informada.
        kits = Kit.objects.none()
        
        if not cor or cor == "Todas":
            kits = Kit.objects.all().order_by('id')
            
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
        # Convertemos QuerySets para listas de dicionários para poder misturar
        produtos_data = ProdutoSerializer(produtos, many=True, context={'request': request}).data
        for p in produtos_data:
            p['tipo'] = 'produto' # Identificador para o Front saber a rota

        kits_data = KitSerializer(kits, many=True, context={'request': request}).data
        for k in kits_data:
            k['tipo'] = 'kit'     # Identificador para o Front saber a rota

        # ---------------------------------------------------
        # 5. Combina e Pagina Manualmente
        # ---------------------------------------------------
        resultados_combinados = produtos_data + kits_data
        
        # Opcional: Ordenar por nome ou preço a lista combinada
        # resultados_combinados.sort(key=lambda x: x['nome']) 

        # Configuração da Paginação Manual
        paginator = StandardResultsSetPagination()
        page_size = paginator.page_size
        
        # Tenta pegar a página da URL (ex: ?page=2), padrão é 1
        try:
            page_number = int(request.query_params.get('page', 1))
        except ValueError:
            page_number = 1

        # Cálculos de fatia (slice)
        start_index = (page_number - 1) * page_size
        end_index = start_index + page_size
        
        # Fatia a lista total
        pagina_atual = resultados_combinados[start_index:end_index]
        count = len(resultados_combinados)

        # Retorna no formato que o React espera (igual ao da paginação automática)
        return Response({
            "count": count,
            "next": f"?page={page_number + 1}" if end_index < count else None,
            "previous": f"?page={page_number - 1}" if page_number > 1 else None,
            "results": pagina_atual
        })

# --- Kit (View Normal) ---
@extend_schema(tags=['Kits'])
class KitViewSet(viewsets.ModelViewSet):
    queryset = Kit.objects.all().order_by('-id')
    serializer_class = KitSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = []

    def get_queryset(self):
        queryset = super().get_queryset()
        destaque = self.request.query_params.get('destaque')
        if destaque == 'true':
            queryset = queryset.filter(destaque=True)
        return queryset