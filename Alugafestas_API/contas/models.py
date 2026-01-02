from django.db import models
from django.contrib.auth.models import User

class UserAdmin(models.Model):
    admin = models.OneToOneField(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.admin
class Evento(models.Model):
    nome = models.CharField(max_length=100)
    
    def __str__(self):
        return self.nome

class Contato(models.Model):
    email = models.EmailField()
    telefone = models.CharField(max_length=20)
    def __str__(self):
        return self.email

class Funcionamento(models.Model):
    dia = models.CharField(max_length=20)
    horario = models.CharField(max_length=50)
    def __str__(self):
        return f"{self.dia}: {self.horario}"