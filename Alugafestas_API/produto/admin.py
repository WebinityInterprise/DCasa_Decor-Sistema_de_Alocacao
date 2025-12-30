from django.contrib import admin
from django.utils.html import format_html
from .models import Categoria, Produto, Kit

# Exibir miniaturas de imagens
def imagem_miniatura(obj):
    if obj.imagem:
        return format_html('<img src="{}" width="50" style="object-fit: cover;"/>', obj.imagem.url)
    return "-"
imagem_miniatura.short_description = 'Imagem'

# Admin de Categoria
@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'destaque', 'imagem_miniatura')
    list_filter = ('destaque',)
    search_fields = ('nome', 'descricao')
    readonly_fields = ('imagem_miniatura',)

    def imagem_miniatura(self, obj):
        return format_html('<img src="{}" width="50" style="object-fit: cover;"/>', obj.imagem.url) if obj.imagem else "-"
    imagem_miniatura.short_description = 'Imagem'

# Admin de Produto
@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'categoria', 'preco_formatado', 'disponivel', 'destaque', 'imagem_miniatura', 'quantidade')
    list_filter = ('categoria', 'disponivel', 'destaque')
    search_fields = ('nome', 'descricao')
    readonly_fields = ('imagem_miniatura',)

    def imagem_miniatura(self, obj):
        return format_html('<img src="{}" width="50" style="object-fit: cover;"/>', obj.imagem.url) if obj.imagem else "-"
    imagem_miniatura.short_description = 'Imagem'

# Admin de Kit
@admin.register(Kit)
class KitAdmin(admin.ModelAdmin):
    list_display = ('nome', 'categoria', 'preco_formatado', 'destaque', 'imagem_miniatura', 'listar_produtos')
    list_filter = ('categoria', 'destaque')
    search_fields = ('nome', 'descricao', 'produtos__nome')
    readonly_fields = ('imagem_miniatura',)

    def imagem_miniatura(self, obj):
        return format_html('<img src="{}" width="50" style="object-fit: cover;"/>', obj.imagem.url) if obj.imagem else "-"
    imagem_miniatura.short_description = 'Imagem'

    def listar_produtos(self, obj):
        return ", ".join([p.nome for p in obj.produtos.all()])
    listar_produtos.short_description = 'Produtos'
