from rest_framework import serializers
from produto.models import Categoria, Produto, Kit, ImagemProduto, KitItem, Evento, EventoItem
from django.db import transaction

# --- Serializer para as imagens extras ---
class ImagemProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagemProduto
        fields = ['id', 'imagem']

# --- Categoria ---
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'slug', 'descricao', 'imagem', 'destaque']

# --- Produto ---
class ProdutoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), source='categoria', write_only=True
    )
    # Imagem Principal
    imagem = serializers.ImageField(use_url=True)
    
    # Imagens do Carrossel (LEITURA - Retorna o objeto completo)
    imagens_carrossel = ImagemProdutoSerializer(many=True, read_only=True)
    
    # Imagens do Carrossel (ESCRITA - Aceita lista de arquivos)
    # Este campo não existe no banco, serve apenas para receber o upload
    upload_imagens_carrossel = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    preco_formatado = serializers.ReadOnlyField()

    class Meta:
        model = Produto
        fields = [
            'id', 
            'codigo',
            'nome', 
            'descricao', 
            'preco', 
            'preco_formatado', 
            'cor',
            'imagem',               # Imagem principal (Capa)
            'imagens_carrossel',    # Visualização (GET)
            'upload_imagens_carrossel', # Upload (POST) - Múltiplos arquivos
            'destaque', 
            'disponivel', 
            'quantidade_estoque', 
            'categoria', 
            'categoria_id'
        ]

    def create(self, validated_data):
        # 1. Removemos as imagens do carrossel dos dados, pois o Produto não tem esse campo direto
        imagens_data = validated_data.pop('upload_imagens_carrossel', [])
        
        # 2. Criamos o Produto normalmente
        produto = Produto.objects.create(**validated_data)
        
        # 3. Criamos as imagens extras vinculadas ao produto criado
        for imagem in imagens_data:
            ImagemProduto.objects.create(produto=produto, imagem=imagem)
            
        return produto
# --- Kit Item (Tabela Intermediária com Quantidade) ---
class KitItemSerializer(serializers.ModelSerializer):
    produto_id = serializers.ReadOnlyField(source='produto.id')
    nome = serializers.ReadOnlyField(source='produto.nome')
    codigo = serializers.ReadOnlyField(source='produto.codigo')
    imagem = serializers.ImageField(source='produto.imagem', read_only=True)
    
    # Aqui o source é necessário pois estamos acessando um nível abaixo (produto.imagens_carrossel)
    imagens_carrossel = ImagemProdutoSerializer(source='produto.imagens_carrossel', many=True, read_only=True)
    
    class Meta:
        model = KitItem
        fields = ['produto_id', 'nome', 'codigo', 'imagem', 'quantidade', 'imagens_carrossel']

# --- Kit ---
class KitItemSerializer(serializers.ModelSerializer):
    # Serializer apenas para leitura/exibição
    produto = ProdutoSerializer(read_only=True)
    class Meta:
        model = KitItem
        fields = ['id', 'produto', 'quantidade']

class KitSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), source='categoria', write_only=True
    )
    imagem = serializers.ImageField(use_url=True)
    
    # Exibe os itens detalhados no GET
    itens = KitItemSerializer(many=True, read_only=True)
    
    # Campo especial para receber os itens no POST (como string JSON)
    # Exemplo: '[{"produto_id": 1, "quantidade": 10}, {"produto_id": 2, "quantidade": 5}]'
    itens_json = serializers.CharField(write_only=True, required=False, help_text="Lista de itens em formato JSON string")

    preco_formatado = serializers.ReadOnlyField()

    class Meta:
        model = Kit
        fields = [
            'id', 
            'codigo', 
            'nome', 
            'descricao', 
            'preco',
            'preco_formatado', 
            'imagem', 
            'destaque', 
            'categoria', 
            'categoria_id',
            'itens',      # Leitura
            'itens_json'  # Escrita
        ]

    def create(self, validated_data):
        # 1. Retira a string de itens dos dados
        itens_string = validated_data.pop('itens_json', None)
        
        # 2. Cria o Kit
        kit = Kit.objects.create(**validated_data)
        
        # 3. Processa os itens se existirem
        if itens_string:
            try:
                # Converte string '[{...}]' para lista Python
                dados_itens = json.loads(itens_string)
                
                for item_data in dados_itens:
                    prod_id = item_data.get('produto_id')
                    qtd = item_data.get('quantidade', 1)
                    if prod_id:
                        prod = Produto.objects.get(id=prod_id)
                        KitItem.objects.create(kit=kit, produto=prod, quantidade=qtd)
                        
                # Opcional: Atualizar preço do kit baseado na soma dos itens
                # kit.atualizar_preco_total() 
            except Exception as e:
                print(f"Erro ao adicionar itens ao kit: {e}")
                
        return kit
class EventoItemSerializer(serializers.ModelSerializer):
    produto_detalhes = ProdutoSerializer(source='produto', read_only=True)
    produto_id = serializers.PrimaryKeyRelatedField(queryset=Produto.objects.all(), source='produto', write_only=True)

    class Meta:
        model = EventoItem
        fields = ['id', 'produto_id', 'produto_detalhes', 'quantidade']

# --- EVENTO ---
class EventoSerializer(serializers.ModelSerializer):
    itens_evento = EventoItemSerializer(many=True, read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    preco_formatado = serializers.ReadOnlyField()

    class Meta:
        model = Evento
        fields = [
            'id', 'codigo', 'nome', 'tipo', 'tipo_display', 'descricao',
            'imagem', 'destaque', 'capacidade_pessoas', 
            'preco', 'preco_formatado', 'itens_evento'
        ]