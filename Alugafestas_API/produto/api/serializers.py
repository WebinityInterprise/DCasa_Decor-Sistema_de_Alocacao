from rest_framework import serializers
from produto.models import Categoria, Produto, Kit, ImagemProduto
from django.db import transaction

# --- Serializer para as imagens extras do carrossel ---
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
    
    # Campo calculado para exibir "R$ XX,XX"
    preco_formatado = serializers.ReadOnlyField()
    
    # Carrossel de imagens (Pega do related_name 'imagens_adicionais' do model)
    imagens_carrossel = ImagemProdutoSerializer(source='imagens_adicionais', many=True, read_only=True)

    class Meta:
        model = Produto
        fields = [
            'id', 
            'codigo',        # Novo campo
            'nome', 
            'descricao', 
            'preco', 
            'preco_formatado', 
            'cor',           # Novo campo para filtros
            'imagem',        # Imagem principal (Capa)
            'imagens_carrossel', # Imagens extras
            'destaque', 
            'disponivel', 
            'quantidade', 
            'categoria', 
            'categoria_id'
        ]

# --- Kit ---
class KitSerializer(serializers.ModelSerializer):
    produtos = ProdutoSerializer(many=True, read_only=True)
    produto_ids = serializers.PrimaryKeyRelatedField(
        queryset=Produto.objects.all(),
        many=True,
        source='produtos',
        write_only=True
    )
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
            'codigo',        # Novo campo
            'nome',
            'descricao',
            'preco',
            'preco_formatado',
            'imagem',
            'destaque',      # Importante para a Home
            'categoria',
            'categoria_id',
            'produtos',
            'produto_ids'
        ]

    @transaction.atomic
    def create(self, validated_data):
        produtos = validated_data.pop('produtos', [])
        kit = Kit.objects.create(**validated_data)
        kit.produtos.set(produtos)
        return kit

    @transaction.atomic
    def update(self, instance, validated_data):
        produtos = validated_data.pop('produtos', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if produtos is not None:
            instance.produtos.set(produtos)
        return instance