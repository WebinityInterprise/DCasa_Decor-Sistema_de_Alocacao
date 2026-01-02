from django.contrib import admin
from .models import Categoria, Produto, ImagemProduto, Kit, KitItem

class ImagemProdutoInline(admin.TabularInline):
    model = ImagemProduto
    extra = 1

class ProdutoAdmin(admin.ModelAdmin):
    inlines = [ImagemProdutoInline]
    list_display = ('nome', 'codigo', 'preco', 'quantidade_estoque', 'disponivel')
    search_fields = ('nome', 'codigo')
    list_filter = ('categoria', 'cor')

# --- CONFIGURAÇÃO PARA O KIT ---
class KitItemInline(admin.TabularInline):
    model = KitItem
    extra = 1
    autocomplete_fields = ['produto'] # Útil se tiver muitos produtos (precisa configurar search_fields no ProdutoAdmin)

class KitAdmin(admin.ModelAdmin):
    inlines = [KitItemInline] # Permite editar quantidades dentro do Kit
    list_display = ('nome', 'codigo', 'preco_formatado', 'destaque')
    search_fields = ('nome', 'codigo')
    
    # Adiciona uma ação para recalcular preços em massa selecionando na lista
    actions = ['recalcular_precos']

    def recalcular_precos(self, request, queryset):
        for kit in queryset:
            kit.atualizar_preco_total()
        self.message_user(request, "Preços recalculados com sucesso!")
    recalcular_precos.short_description = "Recalcular preço baseado nos itens"

admin.site.register(Categoria)
admin.site.register(Produto, ProdutoAdmin)
admin.site.register(Kit, KitAdmin)