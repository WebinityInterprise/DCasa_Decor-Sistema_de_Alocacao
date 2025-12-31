from django.db import models
import random
import string

# Função auxiliar para gerar código aleatório se não for informado (opcional)
def gerar_codigo_unico():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

class Categoria(models.Model):
    nome = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True, null=True, help_text="Usado na URL (ex: casamento-rustico)")
    descricao = models.TextField(blank=True, null=True)
    imagem = models.ImageField(upload_to='categorias/', blank=True, null=True)
    destaque = models.BooleanField(default=False, help_text="Exibir na home como 'Estilo de Evento'?")

    def __str__(self):
        return self.nome

class Produto(models.Model):
    # Opções de cores baseadas no seu Front-end (Pesquisa.jsx)
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

    # Campos Básicos
    codigo = models.CharField(max_length=20, unique=True, default=gerar_codigo_unico, help_text="Código único do produto (ex: PRT001)")
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='produtos')
    nome = models.CharField(max_length=150)
    descricao = models.TextField(blank=True, null=True)
    
    # Filtros e Preço
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    cor = models.CharField(max_length=20, choices=OPCOES_CORES, default='branco', help_text="Essencial para o filtro de cores funcionar")
    
    # Mídia
    imagem = models.ImageField(upload_to='produtos/', blank=True, null=True, help_text="Imagem principal (Capa)")
    
    # Status
    destaque = models.BooleanField(default=False)
    disponivel = models.BooleanField(default=True)
    quantidade = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.codigo} - {self.nome}"

    @property
    def preco_formatado(self):
        return f"R$ {self.preco:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

# Novo Model para o Carrossel de Imagens (Front-end: KitDetalhes)
class ImagemProduto(models.Model):
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE, related_name='imagens_adicionais')
    imagem = models.ImageField(upload_to='produtos/galeria/')

    def __str__(self):
        return f"Imagem de {self.produto.nome}"

class Kit(models.Model):
    codigo = models.CharField(max_length=20, unique=True, default=gerar_codigo_unico, help_text="Código único do kit")
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    nome = models.CharField(max_length=150)
    descricao = models.TextField(blank=True, null=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    
    imagem = models.ImageField(upload_to='kits/', blank=True, null=True, help_text="Imagem principal do Kit")
    
    # Relação com produtos
    produtos = models.ManyToManyField(Produto, related_name='kits')
    
    destaque = models.BooleanField(default=False, help_text="Aparece na seção Destaques da Home")
    
    def __str__(self):
        return f"{self.codigo} - {self.nome}"

    @property
    def preco_formatado(self):
        return f"R$ {self.preco:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")