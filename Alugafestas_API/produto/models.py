from django.db import models

class Categoria(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    imagem = models.ImageField(upload_to='categorias/', blank=True, null=True)
    destaque = models.BooleanField(default=False, help_text="Destacar esta categoria")

    def __str__(self):
        return self.nome

class Produto(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='produtos')
    nome = models.CharField(max_length=150)
    descricao = models.TextField(blank=True, null=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    imagem = models.ImageField(upload_to='produtos/', blank=True, null=True)
    destaque = models.BooleanField(default=False, help_text="Marque como destaque para aparecer na seção de destaques.")
    disponivel = models.BooleanField(default=True)
    quantidade = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.nome

    @property
    def preco_formatado(self):
        return f"R$ {self.preco:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

class Kit(models.Model):
    nome = models.CharField(max_length=150)
    descricao = models.TextField(blank=True, null=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    imagem = models.ImageField(upload_to='kits/', blank=True, null=True)
    produtos = models.ManyToManyField(Produto, related_name='kits')
    destaque = models.BooleanField(default=False)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return self.nome

    @property
    def preco_formatado(self):
        return f"R$ {self.preco:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")