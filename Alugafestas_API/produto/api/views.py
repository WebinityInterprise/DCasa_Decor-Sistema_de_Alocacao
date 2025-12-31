from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter
from produto.models import Categoria, Produto, Kit
from .serializers import CategoriaSerializer, ProdutoSerializer, KitSerializer

# --- Paginação Personalizada ---
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 28  # Número de produtos por página (mesmo do React)
    page_size_query_param = 'page_size'
    max_page_size = 100

# --- Categoria ---
@extend_schema(tags=['Categorias'])
class CategoriaViewSet(viewsets.ModelViewSet):
    """
    Endpoints para gerenciamento de categorias.
    GET permite listar todas as categorias.
    """
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = []  # Ajustar conforme necessidade (ex: IsAuthenticated)

# --- Produto ---
@extend_schema(tags=['Produtos'])
class ProdutoViewSet(viewsets.ModelViewSet):
    """
    Endpoints para gerenciamento de produtos.
    Inclui busca avançada via endpoint customizado.
    """
    queryset = Produto.objects.all().order_by('id')
    serializer_class = ProdutoSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = []

    @extend_schema(
        parameters=[
            OpenApiParameter(name='q', description='Texto para busca no nome, categoria ou código', required=False, type=str),
            OpenApiParameter(name='cor', description='Filtra por cor (ex: azul, branco, todas)', required=False, type=str),
            OpenApiParameter(name='preco_max', description='Filtra pelo preço máximo', required=False, type=float),
            OpenApiParameter(name='categoria', description='Filtra pela categoria (ex: Vasos, Todas)', required=False, type=str),
        ],
        responses=ProdutoSerializer(many=True),
        description="Busca avançada de produtos com filtros de texto, cor, preço e categoria.",
        tags=['Produtos']
    )
    @action(detail=False, methods=['get'])
    def busca_produto(self, request):
        """
        Endpoint customizado para busca de produtos.
        URL: /produtos/busca_produto/?q=vaso&cor=azul&preco_max=50&categoria=Vasos
        """
        queryset = self.get_queryset()

        # Filtro de texto
        query = request.query_params.get('q')
        if query:
            queryset = queryset.filter(
                Q(nome__icontains=query) | 
                Q(categoria__nome__icontains=query) |
                Q(codigo__icontains=query)
            )

        # Filtro de cor
        cor = request.query_params.get('cor')
        if cor and cor != "Todas":
            queryset = queryset.filter(cor__iexact=cor)

        # Filtro de preço máximo
        preco_max = request.query_params.get('preco_max')
        if preco_max:
            queryset = queryset.filter(preco__lte=preco_max)

        # Filtro de categoria
        categoria = request.query_params.get('categoria')
        if categoria and categoria != "Todas":
            queryset = queryset.filter(categoria__nome__iexact=categoria)

        # Paginação
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

# --- Kit ---
@extend_schema(tags=['Kits'])
class KitViewSet(viewsets.ModelViewSet):
    """
    Endpoints para gerenciamento de Kits.
    Permite filtrar kits em destaque para a Home Page.
    """
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
