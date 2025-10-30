from django.contrib import admin
from .models import Categoria, Produto, Kit
# Register your models here.
admin.site.register(Produto)
admin.site.register(Categoria)
admin.site.register(Kit)