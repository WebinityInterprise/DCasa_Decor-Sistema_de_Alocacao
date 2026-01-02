import os
import django
import random
import sys
from django.core.files import File
from django.utils.text import slugify

# CONFIGURAÇÃO DO DJANGO
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Alugafestas_API.settings')
django.setup()

from produto.models import Categoria, Produto, Kit, ImagemProduto, KitItem

# CAMINHO DAS IMAGENS NA RAIZ DO PROJETO
SOURCE_IMG_PATH = os.path.join(os.getcwd(), 'images')

def salvar_imagem(instancia, nome_arquivo_origem, campo_imagem='imagem'):
    caminho_completo = os.path.join(SOURCE_IMG_PATH, nome_arquivo_origem)
    if os.path.exists(caminho_completo):
        with open(caminho_completo, 'rb') as f:
            getattr(instancia, campo_imagem).save(nome_arquivo_origem, File(f), save=True)

def run_seed():
    print("--- INICIANDO SEED ---")

    # ==========================================
    # 0. LIMPEZA (IMPORTANTE)
    # ==========================================
    print("Limpando Kits e Itens antigos...")
    # Apaga apenas os relacionamentos e os kits para recriar as conexões
    KitItem.objects.all().delete() 
    Kit.objects.all().delete()
    
    # Se quiser recriar produtos também, descomente abaixo:
    # Produto.objects.all().delete()
    # Categoria.objects.all().delete()

    # ==========================================
    # 1. CRIAR/RECUPERAR CATEGORIAS
    # ==========================================
    print("\nVerificando Categorias...")
    dados_categorias = [
        {"nome": "Vasos", "imagem": "cat_vasos.jpg"},
        {"nome": "Pratos", "imagem": "cat_pratos.jpg"},
        {"nome": "Taças", "imagem": "cat_tacas.jpg"},
        {"nome": "Móveis", "imagem": "cat_moveis.jpg"},
        {"nome": "Kits Prontos", "imagem": "cat_kits.jpg"},
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
                "slug": slug, "descricao": f"Tudo para {cat_data['nome']}",
                "destaque": cat_data.get("destaque", False)
            }
        )
        if created and "imagem" in cat_data: salvar_imagem(cat, cat_data["imagem"])
        categorias_obj[cat_data["nome"]] = cat

    # ==========================================
    # 2. CRIAR/RECUPERAR PRODUTOS
    # ==========================================
    print("\nVerificando Produtos...")
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
        cat = categorias_obj.get(prod_data["cat"], categorias_obj["Vasos"])
        prod, created = Produto.objects.get_or_create(
            nome=prod_data["nome"],
            defaults={
                "codigo": f"PRD{str(i).zfill(3)}", "categoria": cat,
                "descricao": f"Descrição do {prod_data['nome']}", "preco": prod_data["preco"],
                "cor": prod_data["cor"], "quantidade_estoque": 50, "destaque": True
            }
        )
        if created:
            salvar_imagem(prod, prod_data["img"])
            img_extra = ImagemProduto(produto=prod) # Carrossel
            salvar_imagem(img_extra, prod_data["img"], campo_imagem='imagem')
        
        produtos_criados.append(prod)

    # ==========================================
    # 3. CRIAR KITS (AGORA VAI FUNCIONAR)
    # ==========================================
    print("\nCriando Kits e Adicionando Itens...")
    dados_kits = [
        {"nome": "Kit Sonhos", "img": "kit1.jpg", "destaque": True},
        {"nome": "Kit Elegância", "img": "kit2.jpg", "destaque": True},
        {"nome": "Kit Romance", "img": "kit3.jpg", "destaque": True},
        {"nome": "Kit Alegria", "img": "kit4.jpg", "destaque": True},
        {"nome": "Kit Festa Completa", "img": "kit5.jpg", "destaque": False},
    ]

    for i, kit_data in enumerate(dados_kits):
        # Como apagamos os Kits no início, aqui sempre será created=True
        kit = Kit.objects.create(
            nome=kit_data["nome"],
            codigo=f"KIT{str(i).zfill(3)}",
            categoria=categorias_obj.get("Kits Prontos"),
            descricao="Kit completo para sua festa.",
            preco=0, # Será calculado
            destaque=kit_data["destaque"]
        )
        
        salvar_imagem(kit, kit_data["img"])
        
        # ADICIONA ITENS
        produtos_random = random.sample(produtos_criados, k=random.randint(3, 5))
        for produto in produtos_random:
            KitItem.objects.create(
                kit=kit,
                produto=produto,
                quantidade=random.randint(4, 12) # Ex: 4 a 12 unidades de cada
            )
        
        # Atualiza preço
        kit.atualizar_preco_total()
        print(f" - Criado: {kit.nome} com {kit.itens.count()} produtos. Total: {kit.preco_formatado}")

    print("\n--- SEED FINALIZADO! ---")

if __name__ == "__main__":
    run_seed()