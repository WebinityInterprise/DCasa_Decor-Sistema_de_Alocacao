from django.db import models
import random
import string
from django.db.models import Sum, F

# --- FUNÇÕES AUXILIARES ---
def gerar_codigo_unico():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

# --- CATEGORIA ---
class Categoria(models.Model):
    nome = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True, null=True)
    descricao = models.TextField(blank=True, null=True)
    imagem = models.ImageField(upload_to='categorias/', blank=True, null=True)
    destaque = models.BooleanField(default=False)

    def __str__(self):
        return self.nome

# --- PRODUTO ---
class Produto(models.Model):
    OPCOES_CORES = [
        ('branco', 'Branco'),
        ('preto', 'Preto'),
        ('verde', 'Verde'),
        ('rosa', 'Rosa'),
        ('azul', 'Azul'),
        ('vermelho', 'Vermelho'),
        ('amarelo', 'Amarelo'),
        ('dourado', 'Dourado'),
        ('prateado', 'Prateado'),
        ('lilas', 'Lilás'),
        ('transparente', 'Transparente'),
        ('outra', 'Outra'),
    ]

    codigo = models.CharField(max_length=20, unique=True, default=gerar_codigo_unico)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='produtos')
    nome = models.CharField(max_length=150)
    descricao = models.TextField(blank=True, null=True)
    
    preco = models.DecimalField(max_digits=10, decimal_places=2, help_text="Preço unitário do aluguel")
    cor = models.CharField(max_length=20, choices=OPCOES_CORES, default='branco')
    
    imagem = models.ImageField(upload_to='produtos/', blank=True, null=True)
    
    destaque = models.BooleanField(default=False)
    disponivel = models.BooleanField(default=True)
    # Quantidade TOTAL em estoque no galpão
    quantidade_estoque = models.PositiveIntegerField(default=1, verbose_name="Estoque Total")

    def __str__(self):
        return f"{self.nome} ({self.codigo})"

    @property
    def preco_formatado(self):
        return f"R$ {self.preco:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

# --- IMAGENS EXTRAS DO PRODUTO ---
class ImagemProduto(models.Model):
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE, related_name='imagens_carrossel')
    imagem = models.ImageField(upload_to='produtos/galeria/')

    def __str__(self):
        return f"Imagem extra de {self.produto.nome}"

# --- KIT (O PACOTE) ---
class Kit(models.Model):
    codigo = models.CharField(max_length=20, unique=True, default=gerar_codigo_unico)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    nome = models.CharField(max_length=150)
    descricao = models.TextField(blank=True, null=True)
    
    imagem = models.ImageField(upload_to='kits/', blank=True, null=True)
    destaque = models.BooleanField(default=False)

    # RELAÇÃO ATUALIZADA: Usa o 'through' para apontar para o modelo intermediário
    produtos = models.ManyToManyField(Produto, through='KitItem', related_name='kits')

    # Preço do Kit: Pode ser manual (desconto) ou a soma dos itens.
    # Se você deixar em branco no Admin, ele pode ser calculado automaticamente (veja a lógica abaixo)
    preco = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Se deixar vazio, será a soma dos produtos.")

    def __str__(self):
        return f"Kit: {self.nome}"

    @property
    def preco_formatado(self):
        val = self.preco if self.preco else 0
        return f"R$ {val:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

    # Método para recalcular o preço total baseado nos itens
    def atualizar_preco_total(self):
        # Soma (quantidade * preço do produto) para todos os itens deste kit
        total = self.itens.aggregate(
            total=Sum(F('quantidade') * F('produto__preco'))
        )['total'] or 0
        self.preco = total
        self.save()

# --- ITEM DO KIT (MODELO INTERMEDIÁRIO) ---
class KitItem(models.Model):
    kit = models.ForeignKey(Kit, on_delete=models.CASCADE, related_name='itens')
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade = models.PositiveIntegerField(default=1, help_text="Quantas unidades desse produto vão no kit?")

    class Meta:
        unique_together = ('kit', 'produto') # Evita adicionar o mesmo produto duas vezes no mesmo kit
        verbose_name = "Item do Kit"
        verbose_name_plural = "Itens do Kit"

    def __str__(self):
        return f"{self.quantidade}x {self.produto.nome} no {self.kit.nome}"

    # Opcional: Sempre que salvar um item, atualiza o preço do Kit
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Atualiza o preço do kit pai automaticamente ao salvar um item
        # self.kit.atualizar_preco_total()