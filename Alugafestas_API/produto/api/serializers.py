from rest_framework import serializers
from produto.models import Categoria, Produto, Kit, ImagemProduto, KitItem
from django.db import transaction

# --- Serializer para as imagens extras ---
class ImagemProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagemProduto
        fields = ['id', 'imagem']

# --- Categoria ---
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'slug', 'descricao', 'imagem', 'destaque']

# --- Produto ---
class ProdutoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), source='categoria', write_only=True
    )
    
    preco_formatado = serializers.ReadOnlyField()
    
    # CORREÇÃO AQUI: Removi "source='imagens_carrossel'" pois o nome do campo já é igual.
    imagens_carrossel = ImagemProdutoSerializer(many=True, read_only=True)

    class Meta:
        model = Produto
        fields = [
            'id', 
            'codigo',
            'nome', 
            'descricao', 
            'preco', 
            'preco_formatado', 
            'cor',
            'imagem',
            'imagens_carrossel',
            'destaque', 
            'disponivel', 
            'quantidade_estoque', 
            'categoria', 
            'categoria_id'
        ]

# --- Kit Item (Tabela Intermediária com Quantidade) ---
class KitItemSerializer(serializers.ModelSerializer):
    produto_id = serializers.ReadOnlyField(source='produto.id')
    nome = serializers.ReadOnlyField(source='produto.nome')
    codigo = serializers.ReadOnlyField(source='produto.codigo')
    imagem = serializers.ImageField(source='produto.imagem', read_only=True)
    
    # Aqui o source é necessário pois estamos acessando um nível abaixo (produto.imagens_carrossel)
    imagens_carrossel = ImagemProdutoSerializer(source='produto.imagens_carrossel', many=True, read_only=True)
    
    class Meta:
        model = KitItem
        fields = ['produto_id', 'nome', 'codigo', 'imagem', 'quantidade', 'imagens_carrossel']

# --- Kit ---
class KitSerializer(serializers.ModelSerializer):
    # source='itens' é necessário aqui pois o related_name no model é 'itens', mas o campo na API chamamos de 'produtos'
    produtos = KitItemSerializer(source='itens', many=True, read_only=True)
    
    categoria = CategoriaSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        source='categoria',
        write_only=True,
        required=False,
        allow_null=True
    )
    preco_formatado = serializers.ReadOnlyField()

    class Meta:
        model = Kit
        fields = [
            'id',
            'codigo',
            'nome',
            'descricao',
            'preco',
            'preco_formatado',
            'imagem',
            'destaque',
            'categoria',
            'categoria_id',
            'produtos', 
        ]