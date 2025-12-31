from rest_framework import serializers
from pedido.models import Cliente, Pedido, ItemPedido
from produto.models import Produto, Kit

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nome', 'email', 'telefone', 'endereco', 'numero', 'bairro', 'cidade', 'estado', 'cep', 'observacao']

class ItemPedidoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source="produto.nome", read_only=True)
    
    class Meta:
        model = ItemPedido
        fields = ['id', 'produto', 'produto_nome', 'quantidade', 'preco_unitario', 'subtotal']

class PedidoSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    itens = ItemPedidoSerializer(many=True, read_only=True)
    cliente_id = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all(), source='cliente', write_only=True)
    
    class Meta:
        model = Pedido
        fields = ['id', 'token', 'cliente', 'cliente_id', 'data_evento', 'status', 'criado_em', 'total', 'itens']

class PedidoCreateSerializer(serializers.Serializer):
    nome = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    telefone = serializers.CharField(max_length=20)
    endereco = serializers.CharField(max_length=255)
    numero = serializers.CharField(max_length=20)
    bairro = serializers.CharField(max_length=100)
    cidade = serializers.CharField(max_length=100)
    estado = serializers.CharField(max_length=2, default="SP")
    cep = serializers.CharField(max_length=15)
    data_evento = serializers.DateField(required=True)
    hora_evento = serializers.TimeField(required=True)

class CarrinhoItemSerializer(serializers.Serializer):
    id = serializers.CharField(help_text="ID único no carrinho (ex: 'prod_1' ou 'kit_5')")
    tipo = serializers.CharField(help_text="'produto' ou 'kit'")
    original_id = serializers.IntegerField(help_text="ID real do banco de dados")
    nome = serializers.CharField()
    imagem = serializers.CharField()
    quantidade = serializers.IntegerField()
    preco_unitario = serializers.DecimalField(max_digits=10, decimal_places=2)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)

class CarrinhoSerializer(serializers.Serializer):
    produtos = CarrinhoItemSerializer(many=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)

class AdicionarCarrinhoSerializer(serializers.Serializer):
    quantidade = serializers.IntegerField(min_value=1)

    def validate_quantidade(self, value):
        # Validação simples, a verificação de estoque real ocorre na View
        return value

# Serializer status
class ItemPedidoPublicoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source="produto.nome", read_only=True)
    imagem = serializers.SerializerMethodField()

    class Meta:
        model = ItemPedido
        fields = ["produto_nome", "quantidade", "preco_unitario", "subtotal", "imagem"]

    def get_imagem(self, obj):
        if obj.produto and obj.produto.imagem:
            return obj.produto.imagem.url
        return None

class PedidoStatusSerializer(serializers.ModelSerializer):
    itens = ItemPedidoPublicoSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = ["token", "status", "total", "data_evento", "hora_evento", "criado_em", "itens"]

    def get_total(self, obj):
        return obj.total