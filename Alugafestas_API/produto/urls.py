
from django.urls import path, include

from rest_framework.routers import DefaultRouter
from produto.api.views import CategoriaViewSet, ProdutoViewSet, KitViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'produtos', ProdutoViewSet)
router.register(r'kits', KitViewSet)

urlpatterns = [
   path('', include(router.urls)),
]


   