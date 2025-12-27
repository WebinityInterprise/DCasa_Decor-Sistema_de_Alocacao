from django.contrib import admin
from .models import Pedido, ItemPedido, Cliente


admin.site.register(Pedido)
admin.site.register(ItemPedido)
admin.site.register(Cliente)
# Register your models here.
