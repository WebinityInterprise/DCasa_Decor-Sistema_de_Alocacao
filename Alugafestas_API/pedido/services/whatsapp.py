import requests
from django.conf import settings

def enviar_whatsapp(telefone: str, mensagem: str):
    """
    telefone: DDD + número (ex: 5511999999999)
    """
    url = f"{settings.WHAPI_BASE_URL}/messages/text"

    headers = {
        "Authorization": f"Bearer {settings.WHAPI_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "to": telefone,
        "body": mensagem
    }

    response = requests.post(url, json=payload, headers=headers, timeout=10)

    return response.status_code, response.text
