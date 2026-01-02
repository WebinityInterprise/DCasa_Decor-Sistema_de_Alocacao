from rest_framework import serializers
from pedido.models import Cliente, Pedido, ItemPedido
from produto.models import Produto, Kit

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nome', 'email', 'telefone', 'endereco', 'numero', 'bairro', 'cidade', 'estado', 'cep', 'observacao']

# --- Serializer Atualizado com o Campo Certo ---
class ItemPedidoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.ReadOnlyField(source='produto.nome')
    produto_imagem = serializers.SerializerMethodField()

    class Meta:
        model = ItemPedido
        # CORREÇÃO: 'quantidade' -> 'quantidade_estoque'
        fields = [
            'id', 'produto', 'produto_nome', 'produto_imagem', 
            'quantidade_estoque', 'preco_unitario', 'subtotal'
        ]

    def get_produto_imagem(self, obj):
        request = self.context.get('request')
        if obj.produto and obj.produto.imagem:
            if request:
                return request.build_absolute_uri(obj.produto.imagem.url)
            return obj.produto.imagem.url
        return None

# --- Serializer de Criação (Mantido igual) ---
class PedidoCreateSerializer(serializers.Serializer):
    # Dados do Cliente
    nome = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    telefone = serializers.CharField(max_length=20)
    
    # Endereço
    endereco = serializers.CharField(max_length=255, required=False, allow_blank=True)
    numero = serializers.CharField(max_length=20, required=False, allow_blank=True)
    bairro = serializers.CharField(max_length=100, required=False, allow_blank=True)
    cidade = serializers.CharField(max_length=100, required=False, allow_blank=True)
    estado = serializers.CharField(max_length=2, default="SP")
    cep = serializers.CharField(max_length=15, required=False, allow_blank=True)
    
    # Dados do Evento
    data_evento = serializers.DateField(required=False, allow_null=True)
    hora_evento = serializers.TimeField(required=False, allow_null=True)

    # Dados do Aluguel
    tipo_entrega = serializers.ChoiceField(choices=["RETIRADA", "ENTREGA"], default="RETIRADA")
    data_retirada = serializers.DateField(required=True)
    data_devolucao = serializers.DateField(required=True)

    # Lista de produtos vinda do React
    itens = serializers.JSONField(required=True)

# --- Serializers Auxiliares ---
class CarrinhoItemSerializer(serializers.Serializer):
    id = serializers.CharField(help_text="ID único no carrinho")
    tipo = serializers.CharField()
    original_id = serializers.IntegerField()
    nome = serializers.CharField()
    imagem = serializers.CharField()
    quantidade_estoque = serializers.IntegerField() # Ajustado para padrão
    preco_unitario = serializers.DecimalField(max_digits=10, decimal_places=2)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)

class CarrinhoSerializer(serializers.Serializer):
    produtos = CarrinhoItemSerializer(many=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)

class AdicionarCarrinhoSerializer(serializers.Serializer):
    quantidade = serializers.IntegerField(min_value=1)
    data_retirada = serializers.DateField(required=False, format='%Y-%m-%d')
    data_devolucao = serializers.DateField(required=False, format='%Y-%m-%d')

    def validate_quantidade(self, value):
        return value

# --- Serializer Público Atualizado ---
class ItemPedidoPublicoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source="produto.nome", read_only=True)
    imagem = serializers.SerializerMethodField()

    class Meta:
        model = ItemPedido
        # CORREÇÃO: 'quantidade' -> 'quantidade_estoque'
        fields = ["produto_nome", "quantidade_estoque", "preco_unitario", "subtotal", "imagem"]

    def get_imagem(self, obj):
        if obj.produto and obj.produto.imagem:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.produto.imagem.url)
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

class PedidoSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    itens = ItemPedidoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Pedido
        fields = [
            'id', 'token', 'cliente', 'status', 'criado_em', 'total', 'itens',
            'tipo_entrega', 'data_retirada', 'data_devolucao', 
            'data_evento', 'hora_evento'
        ]