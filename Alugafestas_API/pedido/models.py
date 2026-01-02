import uuid
from django.db import models
from produto.models import Produto

# ==========================
# CLIENTE
# ==========================

class Cliente(models.Model):
    nome = models.CharField(max_length=150)
    email = models.EmailField()
    telefone = models.CharField(max_length=20)

    # Endereço completo
    endereco = models.CharField(max_length=255)
    numero = models.CharField(max_length=20)
    bairro = models.CharField(max_length=100)
    cidade = models.CharField(max_length=100)
    estado = models.CharField(max_length=2)
    cep = models.CharField(max_length=15)

    observacao = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nome


# ==========================
# PEDIDO
# ==========================

class Pedido(models.Model):
    STATUS = [
        ("PENDENTE", "Pendente"),
        ("PAGO", "Pago"),
        ("SEPARANDO", "Separando"),
        ("PRONTO", "Pronto para retirada"),
        ("CANCELADO", "Cancelado"),
        ("CONCLUIDO", "Concluído"),
    ]
    TIPO_ENTREGA_CHOICES = [
        ("RETIRADA", "Retirar na Loja"),
        ("ENTREGA", "Entregar no Endereço"),
    ]
    token = models.CharField(max_length=32, unique=True, default=uuid.uuid4)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name="pedidos")
    criado_em = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS, default="PENDENTE")
    tipo_entrega = models.CharField(max_length=20, choices=TIPO_ENTREGA_CHOICES, default="RETIRADA")
    # Data que o cliente pega ou a loja entrega (Início do aluguel)
    data_retirada = models.DateField(null=True, blank=True)
    
    # Data que o cliente devolve ou a loja busca (Fim do aluguel)
    data_devolucao = models.DateField(null=True, blank=True)
    # Dados do evento
    data_evento = models.DateField(null=True, blank=True)
    hora_evento = models.TimeField(null=True, blank=True)

    def __str__(self):
        return f"Pedido {self.id} - {self.cliente.nome}"

    @property
    def total(self):
        return sum(item.subtotal for item in self.itens.all())


# ==========================
# ITEM DO PEDIDO
# ==========================

class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="itens")
    produto = models.ForeignKey(Produto, on_delete=models.SET_NULL, null=True)
    quantidade_estoque = models.PositiveIntegerField()
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def subtotal(self):
        return self.preco_unitario * self.quantidade

    def __str__(self):
        return f"{self.produto} x {self.quantidade}"


# ==========================
# MOVIMENTAÇÃO DE ESTOQUE
# ==========================

class MovimentoEstoque(models.Model):
    MOV_TIPO = [
        ("ENTRADA", "Entrada"),
        ("SAIDA", "Saída"),
    ]

    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=10, choices=MOV_TIPO)
    quantidade = models.IntegerField()
    motivo = models.CharField(max_length=255, blank=True, null=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo} - {self.produto.nome} ({self.quantidade})"