from rest_framework import viewsets
from produto.models import Categoria, Produto
from produto.api.serializers import CategoriaSerializer, ProdutoSerializer, KitSerializer, Kit, CategoriaBannerSerializer, ProdutoDestaqueSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
class CategoriaViewSet(viewsets.ModelViewSet):
    """
    GET público, outros métodos requerem autenticação
    """
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    


class ProdutoViewSet(viewsets.ModelViewSet):
    """
    GET público, outros métodos requerem autenticação
    """
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def destaque(self, request):
        """
        Retorna todos os produtos marcados como destaque.

        Uso:
             /api/produtos/destaque/

        Descrição:
            Lista apenas os produtos onde o campo `destaque=True`.
            Ideal para exibir na homepage, seções especiais ou vitrines.

        Resposta:
        Lista de produtos usando ProdutoDestaqueSerializer.
        """
        produtos = Produto.objects.filter(destaque=True)
        serializer = ProdutoDestaqueSerializer(produtos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def busca_produto(self, request):
        """
        Busca produtos pelo nome ou pelo nome da categoria.

        Parâmetros:
        - q: texto para pesquisar no nome do produto ou categoria.

        Exemplo:
        /api/produtos/busca_produto/?q=bolo
        /api/produtos/busca_produto/?q=doces
        """
        q = request.query_params.get('q', '').strip()
        categoria = request.query_params.get('categoria')
        produtos = Produto.objects.all()
        
        if q:
            produtos = produtos.filter(
                Q(nome__icontains=q) |               # busca no nome do produto
                Q(categoria__nome__icontains=q)      # busca no nome da categoria
        )
        serializer = ProdutoSerializer(produtos, many= True)
        return Response(serializer.data)
class KitViewSet(viewsets.ModelViewSet):
    """
    GET público, outros métodos requerem autenticação
    """
    queryset = Kit.objects.all()
    serializer_class = KitSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
   