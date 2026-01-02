from django.urls import path, include
from rest_framework_simplejwt.views import TokenVerifyView
from contas.api.views import AdminLoginView, AdminCreateView, AdminTokenRefreshView, AdminPerfilView, InformacoesViewSet
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'admin/informacao-site', InformacoesViewSet, basename='admin-informacao-site')
urlpatterns = [
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('admin/create/', AdminCreateView.as_view(), name='admin-create'),
    path('admin/token/refresh/', AdminTokenRefreshView.as_view(), name='token-refresh'),
    path('admin/token/verify/', TokenVerifyView.as_view(), name='token-verify'),
     path('admin/perfil/', AdminPerfilView.as_view(), name='admin-perfil'),
      path('admin/', include(router.urls)),
]