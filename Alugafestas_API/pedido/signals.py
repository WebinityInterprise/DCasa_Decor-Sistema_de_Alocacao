from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Pedido
from .services.whatsapp import enviar_whatsapp
from .utils.mensagens import mensagem_status_pedido

def normalizar_telefone(telefone):
    telefone = telefone.replace("(", "").replace(")", "").replace("-", "").replace(" ", "")
    return telefone if telefone.startswith("55") else f"55{telefone}"

@receiver(pre_save, sender=Pedido)
def avisar_cliente_status(sender, instance, **kwargs):
    if not instance.pk:
        return

    pedido_antigo = Pedido.objects.get(pk=instance.pk)

    if pedido_antigo.status != instance.status:
        telefone = normalizar_telefone(instance.cliente.telefone)
        mensagem = mensagem_status_pedido(instance)
        enviar_whatsapp(telefone, mensagem)
