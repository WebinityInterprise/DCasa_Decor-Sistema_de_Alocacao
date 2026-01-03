
from django.urls import path, include

from rest_framework.routers import DefaultRouter
from produto.api.views import CategoriaViewSet, ProdutoViewSet, KitViewSet, EventoViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'produtos', ProdutoViewSet)
router.register(r'kits', KitViewSet)
router.register(r'eventos', EventoViewSet)

urlpatterns = [
   path('', include(router.urls)),
]


   