from rest_framework import viewsets
from produto.models import Categoria, Produto
from produto.api.serializers import CategoriaSerializer, ProdutoSerializer, KitSerializer, Kit, CategoriaBannerSerializer, KitBannerSerializer, ProdutoBannerSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
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
 

class KitViewSet(viewsets.ModelViewSet):
    """
    GET público, outros métodos requerem autenticação
    """
    queryset = Kit.objects.all()
    serializer_class = KitSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
   