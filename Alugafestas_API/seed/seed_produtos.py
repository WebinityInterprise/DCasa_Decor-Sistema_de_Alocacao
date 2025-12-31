import os
import django
import random
from django.core.files import File
from django.utils.text import slugify
import sys
# CONFIGURAÇÃO DO DJANGO
# Substitua 'Alugafestas_API' pelo nome da pasta onde está seu settings.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Alugafestas_API.settings')
django.setup()

from produto.models import Categoria, Produto, Kit, ImagemProduto

# CAMINHO DAS IMAGENS NA RAIZ DO PROJETO
SOURCE_IMG_PATH = os.path.join(os.getcwd(), 'images')

def salvar_imagem(instancia, nome_arquivo_origem, campo_imagem='imagem'):
    """
    Tenta abrir a imagem da pasta 'imagens_seed' e salvar no model.
    """
    caminho_completo = os.path.join(SOURCE_IMG_PATH, nome_arquivo_origem)
    
    if os.path.exists(caminho_completo):
        with open(caminho_completo, 'rb') as f:
            # Salva no campo de imagem do model (ex: produto.imagem)
            getattr(instancia, campo_imagem).save(nome_arquivo_origem, File(f), save=True)
            print(f"   [OK] Imagem {nome_arquivo_origem} salva.")
    else:
        print(f"   [AVISO] Imagem {nome_arquivo_origem} não encontrada em {SOURCE_IMG_PATH}")

def run_seed():
    print("--- INICIANDO SEED ---")

    # ==========================================
    # 1. CRIAR CATEGORIAS
    # ==========================================
    print("\nCriando Categorias...")
    
    dados_categorias = [
        {"nome": "Vasos", "imagem": "cat_vasos.jpg"},
        {"nome": "Pratos", "imagem": "cat_pratos.jpg"},
        {"nome": "Taças", "imagem": "cat_tacas.jpg"},
        {"nome": "Móveis", "imagem": "cat_moveis.jpg"},
        {"nome": "Kits Prontos", "imagem": "cat_kits.jpg"},
        # Categorias de Eventos (para a Home)
        {"nome": "Casamento Rústico", "destaque": True, "imagem": "event_casamento.jpg"},
        {"nome": "Festa Infantil", "destaque": True, "imagem": "event_infantil.jpg"},
        {"nome": "Jantar Elegante", "destaque": True, "imagem": "event_jantar.jpg"},
    ]

    categorias_obj = {}

    for cat_data in dados_categorias:
        slug = slugify(cat_data["nome"])
        cat, created = Categoria.objects.get_or_create(
            nome=cat_data["nome"],
            defaults={
                "slug": slug,
                "descricao": f"Tudo para {cat_data['nome']}",
                "destaque": cat_data.get("destaque", False)
            }
        )
        # Tenta salvar imagem se foi criada ou se não tem imagem
        if created or not cat.imagem:
            if "imagem" in cat_data:
                salvar_imagem(cat, cat_data["imagem"])
        
        categorias_obj[cat_data["nome"]] = cat
        print(f" - Categoria: {cat.nome}")


    # ==========================================
    # 2. CRIAR PRODUTOS
    # ==========================================
    print("\nCriando Produtos...")

    # Lista baseada nos dados do seu Front-end (Pesquisa.jsx)
    dados_produtos = [
        {"nome": "Vaso com pé branco 12cm", "cat": "Vasos", "cor": "branco", "preco": 6.00, "img": "kit1.jpg"},
        {"nome": "Vaso garrafa transparente", "cat": "Vasos", "cor": "transparente", "preco": 6.00, "img": "kit2.jpg"},
        {"nome": "Prato de sobremesa floral", "cat": "Pratos", "cor": "rosa", "preco": 5.00, "img": "kit3.jpg"},
        {"nome": "Taça transparente 12cm", "cat": "Taças", "cor": "transparente", "preco": 4.00, "img": "kit4.jpg"},
        {"nome": "Vaso verde 15cm", "cat": "Vasos", "cor": "verde", "preco": 6.00, "img": "kit5.jpg"},
        {"nome": "Vaso dourado 18cm", "cat": "Vasos", "cor": "dourado", "preco": 8.00, "img": "kit6.jpg"},
        {"nome": "Prato azul cerâmica", "cat": "Pratos", "cor": "azul", "preco": 7.00, "img": "kit7.jpg"},
        {"nome": "Taça vermelha decorada", "cat": "Taças", "cor": "vermelho", "preco": 5.00, "img": "kit8.jpg"},
        {"nome": "Vaso prateado moderno", "cat": "Vasos", "cor": "prateado", "preco": 9.00, "img": "kit9.jpg"},
        {"nome": "Cadeira Tiffany", "cat": "Móveis", "cor": "dourado", "preco": 15.00, "img": "moveis1.jpg"},
        {"nome": "Mesa de Bolo Rústica", "cat": "Móveis", "cor": "outra", "preco": 150.00, "img": "moveis2.jpg"},
    ]

    produtos_criados = []

    for i, prod_data in enumerate(dados_produtos):
        categoria = categorias_obj.get(prod_data["cat"])
        if not categoria:
            categoria = categorias_obj["Vasos"] # Fallback

        prod, created = Produto.objects.get_or_create(
            nome=prod_data["nome"],
            defaults={
                "codigo": f"PRD{str(i).zfill(3)}",
                "categoria": categoria,
                "descricao": f"Descrição detalhada do {prod_data['nome']}",
                "preco": prod_data["preco"],
                "cor": prod_data["cor"],
                "quantidade": random.randint(10, 50),
                "destaque": random.choice([True, False])
            }
        )

        if created or not prod.imagem:
             salvar_imagem(prod, prod_data["img"])

        # Cria imagens extras para o carrossel (simulação)
        if created:
            # Reutiliza a mesma imagem como se fosse outro ângulo, só para popular o carrossel
            img_extra = ImagemProduto(produto=prod)
            salvar_imagem(img_extra, prod_data["img"], campo_imagem='imagem')
        
        produtos_criados.append(prod)
        print(f" - Produto: {prod.nome}")


    # ==========================================
    # 3. CRIAR KITS
    # ==========================================
    print("\nCriando Kits...")

    dados_kits = [
        {"nome": "Kit Sonhos", "preco": 31.00, "img": "kit1.jpg", "destaque": True},
        {"nome": "Kit Elegância", "preco": 45.00, "img": "kit2.jpg", "destaque": True},
        {"nome": "Kit Romance", "preco": 52.00, "img": "kit3.jpg", "destaque": True},
        {"nome": "Kit Alegria", "preco": 28.00, "img": "kit4.jpg", "destaque": True},
        {"nome": "Kit Festa Completa", "preco": 150.00, "img": "kit5.jpg", "destaque": False},
    ]

    for i, kit_data in enumerate(dados_kits):
        kit, created = Kit.objects.get_or_create(
            nome=kit_data["nome"],
            defaults={
                "codigo": f"KIT{str(i).zfill(3)}",
                "categoria": categorias_obj.get("Kits Prontos"),
                "descricao": "Kit completo para sua festa ficar incrível. Inclui diversos itens combinando.",
                "preco": kit_data["preco"],
                "destaque": kit_data["destaque"]
            }
        )

        if created or not kit.imagem:
            salvar_imagem(kit, kit_data["img"])
        
        # Adiciona produtos aleatórios ao kit
        if created:
            produtos_random = random.sample(produtos_criados, k=random.randint(3, 6))
            kit.produtos.set(produtos_random)
        
        print(f" - Kit: {kit.nome}")

    print("\n--- SEED FINALIZADO COM SUCESSO! ---")

if __name__ == "__main__":
    run_seed()