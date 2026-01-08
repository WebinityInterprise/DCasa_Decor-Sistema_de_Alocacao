from django.contrib import admin
from .models import Categoria, Produto, ImagemProduto, Kit, KitItem, Evento, EventoItem, Banner

# --- INLINES (Itens dentro de outros modelos) ---

class ImagemProdutoInline(admin.TabularInline):
    model = ImagemProduto
    extra = 1

class KitItemInline(admin.TabularInline):
    model = KitItem
    extra = 1
    # Para usar autocomplete, o ProdutoAdmin precisa ter search_fields definido (o que já tem)
    autocomplete_fields = ['produto'] 

class EventoItemInline(admin.TabularInline):
    model = EventoItem
    extra = 1
    # Usando autocomplete também para manter o padrão visual do Kit (melhor que raw_id_fields)
    autocomplete_fields = ['produto'] 

# --- ADMINS PRINCIPAIS ---

class ProdutoAdmin(admin.ModelAdmin):
    inlines = [ImagemProdutoInline]
    list_display = ('nome', 'codigo', 'preco', 'quantidade_estoque', 'disponivel')
    search_fields = ('nome', 'codigo')
    list_filter = ('categoria', 'cor')

class KitAdmin(admin.ModelAdmin):
    inlines = [KitItemInline]
    list_display = ('nome', 'codigo', 'preco_formatado', 'destaque')
    search_fields = ('nome', 'codigo')
    
    actions = ['recalcular_precos']

    def recalcular_precos(self, request, queryset):
        for kit in queryset:
            kit.atualizar_preco_total() # Certifique-se que o método existe no model Kit
        self.message_user(request, f"Preços de {queryset.count()} kits recalculados!")
    recalcular_precos.short_description = "Recalcular preço (Soma dos Itens)"

class EventoAdmin(admin.ModelAdmin):
    inlines = [EventoItemInline]
    list_display = ('nome', 'tipo', 'capacidade_pessoas', 'preco_formatado', 'destaque')
    list_filter = ('tipo', 'destaque')
    search_fields = ('nome', 'codigo')
    readonly_fields = ('codigo',)

    # Adicionada a mesma ação útil do Kit para o Evento
    actions = ['recalcular_precos']

    def recalcular_precos(self, request, queryset):
        for evento in queryset:
            evento.atualizar_preco_total() # Certifique-se que o método existe no model Evento
        self.message_user(request, f"Preços de {queryset.count()} eventos recalculados!")
    recalcular_precos.short_description = "Recalcular preço (Soma dos Itens)"
@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'ativo', 'ordem')
    list_editable = ('ativo', 'ordem')
# --- REGISTROS NO SITE ---

admin.site.register(Categoria)
admin.site.register(Produto, ProdutoAdmin)
admin.site.register(Kit, KitAdmin)
admin.site.register(Evento, EventoAdmin) 

