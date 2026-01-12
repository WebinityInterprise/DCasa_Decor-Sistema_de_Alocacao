import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from model_bakery import baker
from django.contrib.auth.models import User
from pedido.models import Pedido, ItemPedido, Cliente, MovimentoEstoque
from produto.models import Produto, Kit, Evento

# --- ATENÇÃO AQUI ---
# Verifique se os nomes das suas tabelas intermediárias são esses mesmo.
# Se no seu models.py estiver "class ItemKit(models.Model)", mude aqui.
try:
    from produto.models import KitItem 
except ImportError:
    # Fallback caso o nome seja outro, tente ajustar manualmente se der erro
    pass

# --- Fixtures ---

@pytest.fixture
def client():
    return APIClient()

@pytest.fixture
def admin_client():
    user = baker.make(User, is_staff=True, is_superuser=True)
    client = APIClient()
    client.force_authenticate(user=user)
    return client

# --- 1. Testes do Carrinho (Simulação LocalStorage) ---

@pytest.mark.django_db
def test_carrinho_detalhes_calculo_total(client):
    """
    Simula o envio de itens do localStorage e verifica se o backend
    calcula o total somando Produtos, Kits e Eventos.
    """
    p1 = baker.make(Produto, preco=10.00, nome="Prato")
    k1 = baker.make(Kit, preco=50.00, nome="Kit Festa")
    e1 = baker.make(Evento, preco=100.00, nome="Casamento")
    
    url = reverse('carrinho-detalhes') 
    
    payload = {
        "itens": [
            {"tipo": "produto", "original_id": p1.id, "quantidade": 2}, # 20.00
            {"tipo": "kit", "original_id": k1.id, "quantidade": 1},      # 50.00
            {"tipo": "evento", "original_id": e1.id, "quantidade": 1}    # 100.00
        ]
    }
    
    response = client.post(url, payload, format='json')
    
    assert response.status_code == 200
    # Total esperado: 20 + 50 + 100 = 170
    assert response.data['total'] == 170.00
    assert len(response.data['produtos']) == 3

# --- 2. Testes de Checkout (Finalizar Pedido) ---

@pytest.mark.django_db
def test_finalizar_pedido_baixa_estoque_simples(client):
    """ Compra de produto avulso deve baixar estoque direto. """
    produto = baker.make(Produto, quantidade_estoque=10, preco=10)
    
    url = reverse('carrinho-finalizar')
    
    payload = {
        "nome": "João Silva", "telefone": "1199999999", "email": "joao@teste.com",
        "data_retirada": "2024-12-25", "data_devolucao": "2024-12-26",
        "itens": [
            {"tipo": "produto", "original_id": produto.id, "quantidade": 2}
        ]
    }
    
    response = client.post(url, payload, format='json')
    
    assert response.status_code == 201
    
    # Verifica Cliente e Pedido
    assert Cliente.objects.filter(email="joao@teste.com").exists()
    assert Pedido.objects.count() == 1
    
    # Verifica Estoque (10 - 2 = 8)
    produto.refresh_from_db()
    assert produto.quantidade_estoque == 8

@pytest.mark.django_db
def test_finalizar_pedido_kit_baixa_estoque_componentes(client):
    """
    CRÍTICO: Ao comprar um KIT, o sistema deve baixar o estoque dos PRODUTOS que o compõem.
    """
    # 1. Cria os produtos físicos (estoque 100 cada)
    prato = baker.make(Produto, quantidade_estoque=100)
    copo = baker.make(Produto, quantidade_estoque=100)
    
    # 2. Cria o Kit
    kit = baker.make(Kit, nome="Kit Jantar")
    
    # 3. Associa produtos ao Kit (Simulando a tabela intermediária)
    # ATENÇÃO: Se seu model intermediário não for 'KitItem', ajuste aqui!
    # O 'related_name="itens"' é importante porque sua view usa 'kit.itens.all()'
    try:
        from produto.models import KitItem
        baker.make(KitItem, kit=kit, produto=prato, quantidade=10) # 1 Kit usa 10 Pratos
        baker.make(KitItem, kit=kit, produto=copo, quantidade=5)   # 1 Kit usa 5 Copos
    except ImportError:
        pytest.fail("Não encontrei o model KitItem. Verifique o nome da tabela intermediária em produto/models.py")

    url = reverse('carrinho-finalizar')
    
    # 4. Cliente compra 2 Kits
    payload = {
        "nome": "Maria", "telefone": "11999", "email": "maria@teste.com",
        "data_retirada": "2024-12-30", "data_devolucao": "2024-12-31",
        "itens": [{"tipo": "kit", "original_id": kit.id, "quantidade": 2}]
    }
    
    client.post(url, payload, format='json')
    
    # 5. Validação do Estoque
    # Pratos: 10 por kit * 2 kits = 20 consumidos. (100 - 20 = 80)
    prato.refresh_from_db()
    assert prato.quantidade_estoque == 80
    
    # Copos: 5 por kit * 2 kits = 10 consumidos. (100 - 10 = 90)
    copo.refresh_from_db()
    assert copo.quantidade_estoque == 90

@pytest.mark.django_db
def test_finalizar_pedido_sem_estoque_erro(client):
    """ Deve bloquear a venda se não houver estoque suficiente. """
    prod = baker.make(Produto, quantidade_estoque=5) # Só tem 5
    
    url = reverse('carrinho-finalizar')
    payload = {
        "nome": "Teste", "telefone": "11", "email": "t@t.com",
        "data_retirada": "2024-12-25", "data_devolucao": "2024-12-26",
        "itens": [{"tipo": "produto", "original_id": prod.id, "quantidade": 10}] # Quer 10
    }
    
    response = client.post(url, payload, format='json')
    assert response.status_code == 400
    # Verifica se a mensagem de erro menciona o produto
    assert "insuficiente" in str(response.data)

# --- 3. Teste WhatsApp ---

@pytest.mark.django_db
def test_gerar_link_whatsapp(client):
    pedido = baker.make(Pedido, token="XYZ123", tipo_entrega="RETIRADA")
    cliente = baker.make(Cliente, nome="Ana")
    pedido.cliente = cliente
    pedido.save()
    
    # Adiciona itens para compor a mensagem
    p1 = baker.make(Produto, nome="Mesa")
    baker.make(ItemPedido, pedido=pedido, produto=p1, quantidade_estoque=1, preco_unitario=10)
    
    url = reverse('carrinho-whatsapp', kwargs={'pk': pedido.pk})
    
    response = client.get(url)
    assert response.status_code == 200
    assert "https://wa.me/" in response.data['whatsapp_url']
    # Verifica se o nome do cliente e token estão na URL codificada
    assert "XYZ123" in response.data['whatsapp_url']
    assert "Ana" in response.data['whatsapp_url']

# --- 4. Dashboard Admin ---

@pytest.mark.django_db
def test_admin_dashboard_valores(admin_client):
    """
    Testa se o dashboard ignora pedidos cancelados na soma.
    """
    # Pedido 1 (Válido - PENDENTE): 2 itens de R$ 50 = R$ 100
    p1 = baker.make(Pedido, status="PENDENTE")
    baker.make(ItemPedido, pedido=p1, quantidade_estoque=2, preco_unitario=50)
    
    # Pedido 2 (Inválido - CANCELADO): 1 item de R$ 5000 (Não deve somar)
    p2 = baker.make(Pedido, status="CANCELADO")
    baker.make(ItemPedido, pedido=p2, quantidade_estoque=1, preco_unitario=5000)
    
    url = reverse('admin-pedidos-dashboard') 
    
    response = admin_client.get(url)
    
    assert response.status_code == 200
    assert response.data['total_pedidos'] == 2 # Total conta todos
    assert response.data['valor_total_faturado'] == 100.00 # Faturamento ignora cancelados