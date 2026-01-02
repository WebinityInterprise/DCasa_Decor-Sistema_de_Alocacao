from django.contrib import admin
from .models import UserAdmin, Evento, Contato, Funcionamento

admin.site.register(UserAdmin)
admin.site.register(Evento)
admin.site.register(Contato)
admin.site.register(Funcionamento)
admin.site.site_header = "AlugaFestas Admin"
admin.site.site_title = "AlugaFestas Admin Portal"
