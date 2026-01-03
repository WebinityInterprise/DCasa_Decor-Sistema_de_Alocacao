import os
import sys
import random
import django
from django.core.files import File
from django.utils.text import slugify

# --- 1. CONFIGURAÇÃO DO CAMINHO ---
# Adiciona o diretório atual ao Python para ele achar o 'Alugafestas_API'
sys.path.append(os.getcwd())

# Define o arquivo de configurações
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Alugafestas_API.settings')

try:
    django.setup()
    print("Django configurado com sucesso!")
except ModuleNotFoundError:
    print("ERRO: Não encontrou a pasta 'Alugafestas_API'. Verifique se você está rodando o comando na raiz do projeto.")
    sys.exit(1)

# --- IMPORTS DOS MODELS ---
from produto.models import Categoria, Produto, Kit, KitItem, ImagemProduto, Evento, EventoItem

# CAMINHO DAS IMAGENS
SOURCE_IMG_PATH = os.path.join(os.getcwd(), 'images')

# Lista de imagens de backup (caso a imagem específica não exista)
IMAGENS_GENERICAS = [
    "kit1.jpg", "kit2.jpg", "kit3.jpg", "kit4.jpg", "kit5.jpg", 
    "moveis1.jpg", "moveis2.jpg", "cat_vasos.jpg"
]

def salvar_imagem(instancia, nome_arquivo_origem, campo_imagem='imagem'):
    """ Salva a imagem. Se não achar a específica, pega uma genérica para não dar erro. """
    caminho_completo = os.path.join(SOURCE_IMG_PATH, nome_arquivo_origem)
    
    # Se não existe a imagem exata, tenta pegar uma genérica
    if not os.path.exists(caminho_completo):
        nome_arquivo_origem = random.choice(IMAGENS_GENERICAS)
        caminho_completo = os.path.join(SOURCE_IMG_PATH, nome_arquivo_origem)

    if os.path.exists(caminho_completo):
        with open(caminho_completo, 'rb') as f:
            getattr(instancia, campo_imagem).save(nome_arquivo_origem, File(f), save=True)

def run_seed():
    print("\n--- INICIANDO SEED ---")

    # ==========================================
    # 0. LIMPEZA (Só apaga pacotes, não produtos)
    # ==========================================
    print("1. Limpando Eventos e Kits antigos...")
    EventoItem.objects.all().delete()
    Evento.objects.all().delete()
    KitItem.objects.all().delete()
    Kit.objects.all().delete()

    # ==========================================
    # 1. CATEGORIAS
    # ==========================================
    print("2. Verificando Categorias...")
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
                "slug": slug, 
                "descricao": f"Tudo para {cat_data['nome']}",
                "destaque": cat_data.get("destaque", False)
            }
        )
        if created: salvar_imagem(cat, cat_data["imagem"])
        categorias_obj[cat_data["nome"]] = cat

    # ==========================================
    # 2. PRODUTOS (Cria se não existirem)
    # ==========================================
    print("3. Verificando Produtos...")
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
    
    lista_todos_produtos = []
    
    for i, prod_data in enumerate(dados_produtos):
        cat = categorias_obj.get(prod_data["cat"], categorias_obj["Vasos"])
        
        prod, created = Produto.objects.get_or_create(
            nome=prod_data["nome"],
            defaults={
                "codigo": f"PRD{str(i).zfill(3)}", 
                "categoria": cat,
                "descricao": f"Descrição do {prod_data['nome']}", 
                "preco": prod_data["preco"],
                "cor": prod_data["cor"], 
                "quantidade_estoque": 200, # Aumentei o estoque para caber nos eventos
                "destaque": True
            }
        )
        if created:
            salvar_imagem(prod, prod_data["img"])
            img_extra = ImagemProduto(produto=prod)
            salvar_imagem(img_extra, prod_data["img"], campo_imagem='imagem')
        
        lista_todos_produtos.append(prod)

    # ==========================================
    # 3. KITS (Recriando Kits Prontos)
    # ==========================================
    print("4. Criando Kits...")
    dados_kits = [
        {"nome": "Kit Sonhos", "img": "kit1.jpg"},
        {"nome": "Kit Elegância", "img": "kit2.jpg"},
        {"nome": "Kit Romance", "img": "kit3.jpg"},
    ]

    for i, kit_data in enumerate(dados_kits):
        kit = Kit.objects.create(
            nome=kit_data["nome"],
            codigo=f"KIT{str(i).zfill(3)}",
            categoria=categorias_obj.get("Kits Prontos"),
            descricao="Kit completo para sua festa.",
            destaque=True
        )
        salvar_imagem(kit, kit_data["img"])
        
        # Adiciona 4 produtos aleatórios
        for produto in random.sample(lista_todos_produtos, k=min(4, len(lista_todos_produtos))):
            KitItem.objects.create(kit=kit, produto=produto, quantidade=random.randint(4, 12))
        
        kit.atualizar_preco_total()
        print(f" - Kit criado: {kit.nome}")

    # ==========================================
    # 4. EVENTOS (NOVA FUNCIONALIDADE)
    # ==========================================
    print("5. Criando Eventos...")
    dados_eventos = [
        {"nome": "Casamento Rústico Completo", "tipo": "casamento", "cap": 100, "img": "kit1.jpg"},
        {"nome": "Festa Infantil", "tipo": "aniversario", "cap": 50, "img": "kit5.jpg"},
        {"nome": "Jantar Corporativo", "tipo": "corporativo", "cap": 80, "img": "kit3.jpg"},
    ]

    for i, evt_data in enumerate(dados_eventos):
        evento = Evento.objects.create(
            nome=evt_data["nome"],
            codigo=f"EVT{str(i).zfill(3)}",
            tipo=evt_data["tipo"],
            capacidade_pessoas=evt_data["cap"],
            descricao=f"Pacote para {evt_data['cap']} pessoas. Inclui todo o necessário.",
            destaque=True
        )
        salvar_imagem(evento, evt_data["img"])

        # Lógica para popular o evento com os produtos existentes
        
        # 1. Adiciona cadeiras (1 por pessoa) se existirem
        cadeiras = [p for p in lista_todos_produtos if "Cadeira" in p.nome]
        if cadeiras:
            EventoItem.objects.create(evento=evento, produto=cadeiras[0], quantidade=evt_data["cap"])

        # 2. Adiciona mesas (1 a cada 10 pessoas) se existirem
        mesas = [p for p in lista_todos_produtos if "Mesa" in p.nome]
        if mesas:
            EventoItem.objects.create(evento=evento, produto=mesas[0], quantidade=int(evt_data["cap"]/10) + 1)

        # 3. Adiciona itens variados (Pratos, Taças, Vasos) para compor
        itens_variados = [p for p in lista_todos_produtos if "Cadeira" not in p.nome and "Mesa" not in p.nome]
        if itens_variados:
            # Pega 4 itens aleatórios
            for item in random.sample(itens_variados, k=min(4, len(itens_variados))):
                EventoItem.objects.create(
                    evento=evento, 
                    produto=item, 
                    quantidade=evt_data["cap"] # Quantidade igual ao número de convidados
                )

        evento.atualizar_preco_total()
        print(f" - Evento criado: {evento.nome} ({evento.capacidade_pessoas} pessoas) - Total: {evento.preco_formatado}")

    print("\n--- SEED FINALIZADO COM SUCESSO! ---")

if __name__ == "__main__":
    run_seed()