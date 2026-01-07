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
class ItemPedidoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.ReadOnlyField(source='produto.nome')
    produto_imagem = serializers.SerializerMethodField()

    class Meta:
        model = ItemPedido
        # O campo no banco é 'quantidade_estoque', então usamos ele aqui
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

# --- Serializer de Criação (Checkout) ---
class PedidoCreateSerializer(serializers.Serializer):
    # Cliente
    nome = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    telefone = serializers.CharField(max_length=20)
    
    # Endereço (Opcional se for retirada)
    endereco = serializers.CharField(required=False, allow_blank=True, default="")
    numero = serializers.CharField(required=False, allow_blank=True, default="")
    bairro = serializers.CharField(required=False, allow_blank=True, default="")
    cidade = serializers.CharField(required=False, allow_blank=True, default="")
    estado = serializers.CharField(required=False, allow_blank=True, default="SP")
    cep = serializers.CharField(required=False, allow_blank=True, default="")
    
    # Evento (Opcional)
    data_evento = serializers.DateField(required=False, allow_null=True)
    hora_evento = serializers.TimeField(required=False, allow_null=True)

    # Aluguel
    tipo_entrega = serializers.ChoiceField(choices=["RETIRADA", "ENTREGA"], default="RETIRADA")
    data_retirada = serializers.DateField(required=True)
    data_devolucao = serializers.DateField(required=True)

    # Itens (Aqui recebe Kits, Produtos E EVENTOS misturados)
    itens = serializers.JSONField(required=True)

    # Validação extra para limpar datas vazias
    def validate_data_evento(self, value):
        return value if value else None

    def validate_hora_evento(self, value):
        return value if value else None

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

class PedidoStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = ['status']
        
    def validate_status(self, value):
        value = value.upper()
        
        # Pega as chaves definidas no Model (PENDENTE, PAGO, EM_USO, etc)
        # Assim fica sempre sincronizado
        status_validos = [opcao[0] for opcao in Pedido.STATUS]
        
        if value not in status_validos:
            raise serializers.ValidationError(
                f"Status inválido. As opções permitidas são: {', '.join(status_validos)}"
            )
        return value