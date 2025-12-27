from rest_framework.routers import DefaultRouter
from pedido.api.views import CarrinhoViewSet

router = DefaultRouter()
router.register(r'carrinho', CarrinhoViewSet, basename='carrinho')

urlpatterns = router.urls
