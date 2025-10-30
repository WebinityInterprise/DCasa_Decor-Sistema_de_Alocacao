from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView
from contas.api.views import AdminLoginView, AdminCreateView, AdminTokenRefreshView, AdminPerfilView

urlpatterns = [
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('admin/create/', AdminCreateView.as_view(), name='admin-create'),
    path('admin/token/refresh/', AdminTokenRefreshView.as_view(), name='token-refresh'),
    path('admin/token/verify/', TokenVerifyView.as_view(), name='token-verify'),
     path('admin/perfil/', AdminPerfilView.as_view(), name='admin-perfil'),
]