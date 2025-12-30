from rest_framework import viewsets
from produto.models import Categoria, Produto, Kit
from produto.api.serializers import (
    CategoriaSerializer, ProdutoSerializer, KitSerializer,
    CategoriaBannerSerializer, ProdutoDestaqueSerializer
)
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

# ===========================
# CATEGORIA
# ===========================
class CategoriaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para categorias.

    GET público: todos podem visualizar categorias.
    Outros métodos (POST, PUT, DELETE) requerem autenticação.
    """
    queryset = Categoria.objects.all()          # Todos os objetos da tabela Categoria
    serializer_class = CategoriaSerializer     # Serializer que define como a Categoria será convertida em JSON
    permission_classes = [IsAuthenticatedOrReadOnly]  # GET é público, outros métodos precisam de login

# ===========================
# PRODUTO
# ===========================
class ProdutoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para produtos.

    GET público: todos podem visualizar produtos.
    Outros métodos (POST, PUT, DELETE) requerem autenticação.
    """
    queryset = Produto.objects.all()           # Todos os produtos
    serializer_class = ProdutoSerializer       # Serializer padrão
    permission_classes = [IsAuthenticatedOrReadOnly]  

    # ---------------------------
    # PRODUTOS EM DESTAQUE
    # ---------------------------
    @action(detail=False, methods=['get'])
    def destaque(self, request):
        """
        Retorna todos os produtos marcados como destaque.

        Uso:
            /api/produtos/destaque/

        Ideal para exibir na homepage ou vitrines.

        Retorna:
            Lista de produtos usando ProdutoDestaqueSerializer.
        """
        produtos = Produto.objects.filter(destaque=True)
        serializer = ProdutoDestaqueSerializer(produtos, many=True)
        return Response(serializer.data)

    # ---------------------------
    # BUSCA DE PRODUTOS
    # ---------------------------
    @action(detail=False, methods=['get'])
    def busca_produto(self, request):
        """
        Busca produtos por nome, categoria, cor, tamanho e faixa de preço.

        Parâmetros de query string:
        - q: texto para pesquisar no nome do produto ou categoria
        - cor: cor do produto (opcional, precisa existir no modelo)
        - tamanho: tamanho do produto (opcional, precisa existir no modelo)
        - preco_min: preço mínimo (opcional)
        - preco_max: preço máximo (opcional)

        Exemplos:
        /api/produtos/busca_produto/?q=bolo&cor=vermelho&tamanho=M&preco_min=10&preco_max=100
        """
        q = request.query_params.get('q', '').strip()        # pesquisa por nome ou categoria
        cor = request.query_params.get('cor', '').strip()    # pesquisa por cor
        preco_min = request.query_params.get('preco_min')    # preço mínimo
        preco_max = request.query_params.get('preco_max')    # preço máximo

        produtos = Produto.objects.all()                     # inicia com todos os produtos

        # Filtra por nome ou categoria
        if q:
            produtos = produtos.filter(
                Q(nome__icontains=q) |
                Q(categoria__nome__icontains=q)
            )

        # Filtra por cor
        if cor:
            produtos = produtos.filter(cor__icontains=cor)  # precisa do campo 'cor' no modelo Produto

        # Filtra por preço mínimo
        if preco_min:
            produtos = produtos.filter(preco__gte=preco_min)

        # Filtra por preço máximo
        if preco_max:
            produtos = produtos.filter(preco__lte=preco_max)

        serializer = ProdutoSerializer(produtos, many=True)
        return Response(serializer.data)

# ===========================
# KIT
# ===========================
class KitViewSet(viewsets.ModelViewSet):
    """
    ViewSet para kits de produtos.

    GET público: todos podem visualizar kits.
    Outros métodos (POST, PUT, DELETE) requerem autenticação.
    """
    queryset = Kit.objects.all()             # Todos os kits
    serializer_class = KitSerializer         # Serializer padrão para kits
    permission_classes = [IsAuthenticatedOrReadOnly]
