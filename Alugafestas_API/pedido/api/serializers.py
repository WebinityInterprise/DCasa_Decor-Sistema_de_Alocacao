from rest_framework import serializers
from pedido.models import Cliente, Pedido, ItemPedido
from produto.models import Produto

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nome', 'email', 'telefone', 'endereco', 'numero','bairro' ,'cidade', 'estado', 'cep', 'observacao']
        
        
class ItemPedidoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source="produto.nome", read_only=True)
    
    class Meta:
        model = ItemPedido
        fields = ['id', 'produto', 'produto_nome','quantidade', 'preco_unitario', 'subtotal']
        
        
class PedidoSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    itens = ItemPedidoSerializer(many=True, read_only=True)
    cliente_id = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all(), source='cliente', write_only=True)
    
    class Meta:
        model = Pedido
        fields = ['id', 'token','cliente', 'cliente_id', 'data_evento', 'status', 'criado_em','total', 'itens']
        
class PedidoCreateSerializer(serializers.Serializer):
    produto_id = serializers.IntegerField(default=1)
    quantidade = serializers.IntegerField(default=1)
    nome = serializers.CharField(max_length=150, default="João da Silva")
    email = serializers.EmailField(default="joao@email.com")
    telefone = serializers.CharField(max_length=20, default="11999999999")
    endereco = serializers.CharField(max_length=255, default="Rua das Flores")
    numero = serializers.CharField(max_length=20, default="123")
    bairro = serializers.CharField(max_length=100, default="Centro")
    cidade = serializers.CharField(max_length=100, default="São Paulo")
    estado = serializers.CharField(max_length=2, default="SP")
    cep = serializers.CharField(max_length=15, default="01001-000")
    data_evento = serializers.DateField(required=False, allow_null=True, default="2025-12-30")
    hora_evento = serializers.TimeField(required=False, allow_null=True, default="18:00")
class CarrinhoItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nome = serializers.CharField()
    quantidade = serializers.IntegerField()
    preco_unitario = serializers.DecimalField(max_digits=10, decimal_places=2)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)

class CarrinhoSerializer(serializers.Serializer):
    produtos = CarrinhoItemSerializer(many=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    
class AdicionarCarrinhoSerializer(serializers.Serializer):
    quantidade = serializers.IntegerField(
        min_value=1,
        help_text="Quantidade do produto a ser adicionada ao carrinho"
    )

    def validate_quantidade(self, value):
        produto: Produto = self.context["produto"]

        if value > produto.quantidade:
            raise serializers.ValidationError(
                f"Quantidade indisponível. Estoque atual: {produto.quantidade}"
            )

        return value
    
class ItemPedidoPublicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemPedido
        fields = ["produto", "quantidade", "preco_unitario", "subtotal"]

class PedidoStatusSerializer(serializers.ModelSerializer):
    itens = ItemPedidoPublicoSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = ["token", "status", "total", "data_evento", "hora_evento", "criado_em", "itens"]

    def get_total(self, obj):
        return obj.total