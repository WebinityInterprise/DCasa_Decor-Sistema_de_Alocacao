
from django.urls import path, include
from contas.api.views import AdminLoginVIew, AdminCreateView

urlpatterns = [
    path("admin/login", AdminLoginVIew.as_view(), name="login-admin"),
    path("admin/create", AdminCreateView.as_view(), name="create-admin"),
] 
