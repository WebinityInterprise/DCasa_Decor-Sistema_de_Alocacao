from rest_framework.routers import DefaultRouter
from pedido.api.views import CarrinhoViewSet,AdminPedidoViewSet

router = DefaultRouter()
router.register(r'carrinho', CarrinhoViewSet, basename='carrinho')
router.register(r'admin/pedidos', AdminPedidoViewSet, basename='admin-pedidos') # Rota segura
urlpatterns = router.urls
