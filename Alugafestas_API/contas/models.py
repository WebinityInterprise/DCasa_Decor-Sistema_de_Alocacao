from django.db import models
from django.contrib.auth.models import User

class UserAdmin(models.Model):
    admin = models.OneToOneField(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.admin