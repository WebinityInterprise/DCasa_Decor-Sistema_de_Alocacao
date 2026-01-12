import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from model_bakery import baker
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile # <--- Importante!
from produto.models import Produto, Kit, Categoria, Banner

# --- Fixtures ---

@pytest.fixture
def client():
    return APIClient()

@pytest.fixture
def usuario_logado(client):
    user = baker.make(User)
    client.force_authenticate(user=user)
    return user

# Função auxiliar para gerar imagem compatível com Django ImageField
def gerar_imagem_teste():
    return SimpleUploadedFile(
        name='teste.jpg',
        content=b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x05\x04\x04\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b',
        content_type='image/jpeg'
    )

# --- 1. Testes de Categoria ---

@pytest.mark.django_db
def test_categoria_listagem_publica(client):
    baker.make(Categoria, _quantity=3)
    url = reverse('categoria-list') 
    
    response = client.get(url)
    assert response.status_code == 200
    
    dados = response.data
    if isinstance(dados, dict) and 'results' in dados:
        assert len(dados['results']) == 3
    else:
        assert len(dados) == 3

@pytest.mark.django_db
def test_categoria_criacao_sucesso(client, usuario_logado):
    url = reverse('categoria-list')
    
    # CORREÇÃO: Usamos 'format=multipart' e um arquivo real
    payload = {
        "nome": "Categoria Nova",
        "slug": "cat-nova", 
        "imagem": gerar_imagem_teste(), 
        "destaque": True
    }
    
    # Atenção: format='multipart' é necessário para envio de arquivos
    response = client.post(url, payload, format='multipart')
    
    if response.status_code != 201:
        print("\nERRO API Categoria:", response.data)

    assert response.status_code == 201

# --- 2. Testes da Busca ---

@pytest.mark.django_db
def test_busca_produto_mistura_kits_e_produtos(client):
    cat = baker.make(Categoria, nome="Geral")
    baker.make(Produto, nome="Mesa X", categoria=cat, disponivel=True)
    baker.make(Kit, nome="Kit Mesa Y", categoria=cat)
    
    url = reverse('produto-busca-produto') 
    response = client.get(url, {'q': 'Mesa'})
    
    assert response.status_code == 200
    dados = response.data['results'] if 'results' in response.data else response.data
    assert len(dados) == 2

@pytest.mark.django_db
def test_busca_produto_filtros(client):
    baker.make(Produto, nome="Azul Barato", preco=10, cor="Azul")
    baker.make(Produto, nome="Vermelho Caro", preco=100, cor="Vermelho")
    
    url = reverse('produto-busca-produto')
    response = client.get(url, {'cor': 'Azul', 'preco_max': 50})
    
    assert response.status_code == 200
    dados = response.data['results'] if 'results' in response.data else response.data
    assert len(dados) == 1
    assert dados[0]['nome'] == "Azul Barato"

# --- 3. Testes de Kit ---

@pytest.mark.django_db
def test_criar_kit_com_itens(client, usuario_logado):
    prod = baker.make(Produto)
    cat = baker.make(Categoria)
    
    url = reverse('kit-list')

    # Truque: Para enviar arquivo + lista, usamos multipart
    # Mas precisamos "achatar" a lista usando a sintaxe [indice][campo]
    payload = {
        "nome": "Kit Teste",
        "codigo": "K99",
        "categoria_id": cat.id, 
        "preco": 100.00,
        "imagem": gerar_imagem_teste(), # Agora enviamos a imagem!
        
        # SINTAXE DE LISTA PARA MULTIPART FORM:
        "itens_input[0]produto_id": prod.id,
        "itens_input[0]quantidade": 5
    }

    # Usamos multipart para aceitar a imagem
    response = client.post(url, payload, format='multipart')
    
    if response.status_code != 201:
        print("\nERRO API Kit:", response.data)

    assert response.status_code == 201
    assert Kit.objects.filter(codigo="K99").exists()

# --- 4. Testes de Banner ---

@pytest.mark.django_db
def test_banner_listagem_sem_paginacao(client):
    url = reverse('banner-list')
    baker.make(Banner, ativo=True, titulo="Banner Top")
    
    response = client.get(url)
    assert response.status_code == 200
    assert isinstance(response.data, list) 
    assert len(response.data) == 1