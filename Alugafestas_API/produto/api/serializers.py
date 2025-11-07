from rest_framework import serializers
from produto.models import Categoria, Produto, Kit
from django.db import transaction
class CategoriaSerializer(serializers.ModelSerializer):
     class Meta:
        model = Categoria
        fields = ['id', 'nome','descricao', 'imagem']
        
        
class ProdutoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all(), source='categoria', write_only=True)
    preco_formatado = serializers.ReadOnlyField()
    class Meta:
        model = Produto
        fields = ['id', 'nome', 'descricao', 'preco', 'preco_formatado', 'imagem', 'destaque', 'disponivel', 'quantidade','categoria', 'categoria_id']
        
        
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
        write_only=True
    )
    preco_formatado = serializers.ReadOnlyField()

    class Meta:
        model = Kit
        fields = [
            'id',
            'nome',
            'descricao',
            'preco',
            'preco_formatado',
            'imagem',
            'destaque',
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
        
        
        
# Serializers específicos para banner
class CategoriaBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'descricao', 'imagem']

class ProdutoDestaqueSerializer(serializers.ModelSerializer):
    categoria = CategoriaBannerSerializer(read_only=True)
    preco_formatado = serializers.ReadOnlyField()

    class Meta:
        model = Produto
        fields = [
            'id',
            'nome',
            'descricao',
            'preco',
            'preco_formatado',
            'imagem',
            'categoria'
        ]
