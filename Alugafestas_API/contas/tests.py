import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from model_bakery import baker
from django.contrib.auth.models import User
from contas.models import Evento, Contato, Funcionamento

# --- Fixtures ---

@pytest.fixture
def client():
    return APIClient()

@pytest.fixture
def usuario_comum(client):
    # Usuário logado, mas NÃO é admin
    user = baker.make(User, is_staff=False)
    client.force_authenticate(user=user)
    return user

@pytest.fixture
def usuario_admin(client):
    # Usuário logado E admin
    user = baker.make(User, is_staff=True, is_superuser=True)
    client.force_authenticate(user=user)
    return user

# --- 1. Testes de Login e Criação ---

@pytest.mark.django_db
def test_admin_login_sucesso(client):
    # CORREÇÃO: Criamos um usuário com is_staff=True, pois é login de ADMIN
    user = User.objects.create_user(
        username='admin', 
        email='admin@teste.com', 
        password='password123',
        is_staff=True # Importante!
    )
    
    # Nome correto pego do seu urls.py
    url = reverse('admin-login')

    payload = {
        "email": "admin@teste.com",
        "password": "password123"
    }
    
    response = client.post(url, payload)
    
    # Se ainda der 400, imprime o erro para debug
    if response.status_code != 200:
        print("\nErro Login:", response.data)

    assert response.status_code == 200
    assert 'access' in response.data
    assert response.data['email'] == 'admin@teste.com'

@pytest.mark.django_db
def test_admin_login_senha_errada(client):
    User.objects.create_user(username='admin', email='admin@teste.com', password='password123', is_staff=True)
    
    url = reverse('admin-login')
        
    payload = {
        "email": "admin@teste.com",
        "password": "senhaerrada"
    }
    
    response = client.post(url, payload)
    # Espera 400 ou 401
    assert response.status_code in [400, 401]

@pytest.mark.django_db
def test_criar_admin_sucesso(client):
    # Nome correto pego do seu urls.py
    url = reverse('admin-create')

    payload = {
        "username": "novo_admin",
        "email": "novo@admin.com",
        "password": "senhaForte123",
        "first_name": "Novo",
        "last_name": "Admin"
    }
    
    response = client.post(url, payload)
    
    if response.status_code != 201:
        print("\nErro Criação Admin:", response.data)
        
    assert response.status_code == 201
    assert User.objects.filter(email="novo@admin.com").exists()

# --- 2. Testes de Perfil ---

@pytest.mark.django_db
def test_perfil_acesso_negado_sem_token(client):
    # Nome correto: 'admin-perfil'
    url = reverse('admin-perfil')
        
    response = client.get(url)
    assert response.status_code == 401 # Unauthorized

@pytest.mark.django_db
def test_perfil_acesso_negado_nao_admin(client, usuario_comum):
    url = reverse('admin-perfil')
        
    response = client.get(url)
    assert response.status_code == 403 # Forbidden

@pytest.mark.django_db
def test_perfil_acesso_sucesso_admin(client, usuario_admin):
    url = reverse('admin-perfil')
        
    response = client.get(url)
    assert response.status_code == 200
    assert response.data['email'] == usuario_admin.email

@pytest.mark.django_db
def test_perfil_atualizar_dados(client, usuario_admin):
    # 1. Definimos uma senha conhecida para o usuário
    senha_conhecida = "SenhaForte123!"
    usuario_admin.set_password(senha_conhecida)
    usuario_admin.save()
    
    # Precisamos re-autenticar o cliente porque mudar a senha pode derrubar a sessão anterior
    client.force_authenticate(user=usuario_admin)

    url = reverse('admin-perfil')
        
    payload = {
        "first_name": "Nome Alterado",
        "email": "email_atualizado@teste.com",
        "username": usuario_admin.username,
        # 2. Enviamos a senha atual conforme o Serializer exige
        "senha_atual": senha_conhecida
    }
    
    response = client.patch(url, payload, format='json')
    
    if response.status_code != 200:
        print("\nERRO Update Perfil:", response.data)

    assert response.status_code == 200
    
    usuario_admin.refresh_from_db()
    assert usuario_admin.first_name == "Nome Alterado"

# --- 3. Testes Institucionais (InformacaoSite) ---

@pytest.mark.django_db
def test_informacoes_listagem_publica(client):
    baker.make(Evento, nome="Natal")
    baker.make(Contato, email="sac@loja.com")
    
    # CORREÇÃO: Nome gerado pelo router (basename + -list)
    # basename='admin-informacao-site' -> 'admin-informacao-site-list'
    url = reverse('admin-informacao-site-list') 
    
    response = client.get(url)
    assert response.status_code == 200
    assert len(response.data['eventos']) == 1
    assert len(response.data['contatos']) == 1
    assert response.data['eventos'][0]['nome'] == "Natal"

@pytest.mark.django_db
def test_informacoes_criar_sem_login_falha(client):
    url = reverse('admin-informacao-site-list')
    response = client.post(url, {})
    assert response.status_code == 401

@pytest.mark.django_db
def test_informacoes_criar_com_sucesso(client, usuario_admin):
    url = reverse('admin-informacao-site-list')
    
    payload = {
        "eventos": [{"nome": "Páscoa"}],
        "contatos": [{"email": "novo@teste.com", "telefone": "999"}],
        "funcionamento": [{"dia": "Sexta", "horario": "08-18"}]
    }
    
    response = client.post(url, payload, format='json')
    
    if response.status_code != 201:
        print("\nErro Informações:", response.data)
        
    assert response.status_code == 201
    assert Evento.objects.filter(nome="Páscoa").exists()
    assert Contato.objects.filter(email="novo@teste.com").exists()