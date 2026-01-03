from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.db import transaction
import urllib.parse
import random
import string
from urllib.parse import quote_plus
from rest_framework import serializers
from drf_spectacular.utils import extend_schema, OpenApiExample
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

# --- IMPORTANTE: ADICIONEI EVENTO E EVENTOITEM AQUI ---
from produto.models import Produto, Kit, Evento
from pedido.models import Cliente, Pedido, ItemPedido, MovimentoEstoque
from pedido.api.serializers import (
    PedidoSerializer,
    PedidoCreateSerializer,
    PedidoStatusSerializer
)

def gerar_token_aleatorio(length=8):
    caracteres = string.ascii_uppercase + string.digits
    return ''.join(random.choices(caracteres, k=length))


class CarrinhoViewSet(viewsets.ViewSet):
    """
    ViewSet para gerenciar o carrinho via LocalStorage (Front-end).
    """

    @extend_schema(summary="Obter detalhes dos itens do LocalStorage")
    @action(detail=False, methods=["post"], url_path="detalhes")
    def detalhes(self, request):
        itens_local = request.data.get("itens", [])
        lista_formatada = []
        total_geral = 0

        for item in itens_local:
            tipo = item.get("tipo")
            orig_id = item.get("original_id")
            # Quantidade que vem do carrinho
            qtd = int(item.get("quantidade", 1))

            try:
                obj = None
                
                # --- LÓGICA DE BUSCA UNIFICADA ---
                if tipo == "kit":
                    obj = Kit.objects.get(id=orig_id)
                elif tipo == "evento": # <--- ADICIONADO
                    obj = Evento.objects.get(id=orig_id)
                else: # produto
                    obj = Produto.objects.get(id=orig_id)

                preco = float(obj.preco)
                subtotal = preco * qtd
                total_geral += subtotal
                
                img_url = request.build_absolute_uri(obj.imagem.url) if obj.imagem else ""

                lista_formatada.append({
                    "id": item.get("id"), 
                    "tipo": tipo,
                    "original_id": orig_id,
                    "codigo": getattr(obj, 'codigo', ''), # Alguns podem não ter codigo
                    "nome": obj.nome,
                    "imagem": img_url,
                    "quantidade": qtd,
                    "preco_unitario": preco,
                    "subtotal": subtotal,
                    "data_retirada": item.get("data_retirada"),
                    "data_devolucao": item.get("data_devolucao"),
                })
            except (Kit.DoesNotExist, Produto.DoesNotExist, Evento.DoesNotExist):
                continue

        return Response({
            "produtos": lista_formatada, 
            "total": total_geral
        })

    # ... (consultar_pedido MANTIDO IGUAL) ...
    @extend_schema(summary="Consultar pedido pelo código")
    @action(detail=False, methods=["get"], url_path=r"consultar/(?P<codigo>[A-Z0-9]+)")
    def consultar_pedido(self, request, codigo=None):
        pedido = get_object_or_404(Pedido, token=codigo)
        serializer = PedidoSerializer(pedido, context={'request': request})
        return Response(serializer.data)

    @extend_schema(summary="Finalizar pedido (Checkout via LocalStorage)")
    @action(detail=False, methods=["post"], url_path="finalizar")
    @transaction.atomic 
    def finalizar(self, request):
        serializer = PedidoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        itens_carrinho = request.data.get("itens", [])

        if not itens_carrinho:
            return Response({"error": "O carrinho está vazio."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Cliente
        cliente, _ = Cliente.objects.get_or_create(
            email=data["email"],
            defaults={
                "nome": data["nome"],
                "telefone": data["telefone"],
                "endereco": data.get("endereco", ""),
                "numero": data.get("numero", ""),
                "bairro": data.get("bairro", ""),
                "cidade": data.get("cidade", ""),
                "estado": data.get("estado", "SP"),
                "cep": data.get("cep", ""),
            }
        )

        # 2. Pedido
        pedido = Pedido.objects.create(
            cliente=cliente,
            token=gerar_token_aleatorio(10),
            status="PENDENTE",
            tipo_entrega=data.get("tipo_entrega", "RETIRADA"),
            data_retirada=data["data_retirada"],
            data_devolucao=data["data_devolucao"],
            data_evento=data.get("data_evento"),
            hora_evento=data.get("hora_evento")
        )

        # 3. Processar Itens (Produto, Kit e Evento)
        for item in itens_carrinho:
            orig_id = item.get("original_id")
            tipo = item.get("tipo")
            qtd_carrinho = int(item.get("quantidade", 1))

            # --- CASO 1: KIT ---
            if tipo == "kit":
                kit = get_object_or_404(Kit, id=orig_id)
                for item_kit in kit.itens.all(): # Assume related_name='itens' no KitItem
                    produto_real = item_kit.produto
                    qtd_total_baixar = item_kit.quantidade * qtd_carrinho
                    
                    self._baixar_estoque(pedido, produto_real, qtd_total_baixar, f"Kit {kit.nome}")

            # --- CASO 2: EVENTO (NOVO!) ---
            elif tipo == "evento":
                evento = get_object_or_404(Evento, id=orig_id)
                
                # Assume que Evento tem related_name='itens_evento' no EventoItem
                for item_evt in evento.itens_evento.all():
                    produto_real = item_evt.produto
                    # A quantidade definida no evento * quantas vezes o evento foi alugado
                    qtd_total_baixar = item_evt.quantidade * qtd_carrinho
                    
                    self._baixar_estoque(pedido, produto_real, qtd_total_baixar, f"Evento {evento.nome}")

            # --- CASO 3: PRODUTO AVULSO ---
            else:
                produto = get_object_or_404(Produto, id=orig_id)
                self._baixar_estoque(pedido, produto, qtd_carrinho, "Avulso")

        return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)

    def _baixar_estoque(self, pedido, produto, quantidade, origem):
        """ Função auxiliar para não repetir código de baixa de estoque """
        if produto.quantidade_estoque < quantidade:
            raise serializers.ValidationError(f"Estoque insuficiente para {produto.nome} (Origem: {origem})")
        
        # Registra o item no pedido (para histórico)
        ItemPedido.objects.create(
            pedido=pedido,
            produto=produto,
            quantidade_estoque=quantidade,
            preco_unitario=produto.preco
        )
        
        # Baixa física do estoque
        produto.quantidade_estoque -= quantidade
        produto.save()
        
        # Log de movimento
        MovimentoEstoque.objects.create(
            produto=produto, 
            tipo="SAIDA", 
            quantidade=quantidade, 
            motivo=f"Pedido {pedido.token} ({origem})"
        )

    # ... (método whatsapp MANTIDO IGUAL) ...
    @extend_schema(summary="Gerar link WhatsApp")
    @action(detail=True, methods=["get"])
    def whatsapp(self, request, pk=None):
        pedido = get_object_or_404(Pedido, pk=pk)
        cliente = pedido.cliente

        # 1. Formata Datas
        fmt_data = lambda d: d.strftime('%d/%m/%Y') if d else "N/A"
        fmt_hora = lambda h: h.strftime('%H:%M') if h else ""
        
        data_evento_str = f"{fmt_data(pedido.data_evento)}"
        if pedido.hora_evento:
            data_evento_str += f" às {fmt_hora(pedido.hora_evento)}"

        # 2. Cabeçalho e Dados do Cliente
        texto = (
            f" *PEDIDO #{pedido.token}*\n"
            f"──────────────────\n"
            f" *CLIENTE*\n"
            f"Nome: {cliente.nome}\n"
            f"Tel: {cliente.telefone}\n"
            f"Email: {cliente.email}\n\n"
        )

        # 3. Dados do Evento e Datas
        texto += (
            f" *DADOS DO ALUGUEL*\n"
            f"Evento: {data_evento_str}\n"
            f"Retirada: {fmt_data(pedido.data_retirada)}\n"
            f"Devolução: {fmt_data(pedido.data_devolucao)}\n\n"
        )

        # 4. Dados de Entrega
        tipo_txt = " Receber em Casa" if pedido.tipo_entrega == "ENTREGA" else " Retirar na Loja"
        texto += f"{tipo_txt}\n"
        
        if pedido.tipo_entrega == "ENTREGA":
            texto += (
                f"End: {cliente.endereco}, {cliente.numero}\n"
                f"Bairro: {cliente.bairro}\n"
                f"Cidade: {cliente.cidade} - {cliente.estado}\n"
                f"CEP: {cliente.cep}\n"
            )
        
        texto += "──────────────────\n"
        texto += " *ITENS RESERVADOS*\n"

        # 5. Lista de Itens (Agrupando produtos iguais se necessário)
        # Como o 'finalizar' explode Kits/Eventos em itens individuais,
        # aqui listamos a soma total de cada item físico (ex: 200 pratos, 200 garfos)
        
        itens_agrupados = {}
        subtotal_acumulado = 0

        for item in pedido.itens.all():
            nome = item.produto.nome if item.produto else "Item Removido"
            qtd = item.quantidade_estoque
            valor = item.preco_unitario * qtd
            
            if nome in itens_agrupados:
                itens_agrupados[nome]['qtd'] += qtd
                itens_agrupados[nome]['valor'] += valor
            else:
                itens_agrupados[nome] = {'qtd': qtd, 'valor': valor}
            
            subtotal_acumulado += valor

        for nome, dados in itens_agrupados.items():
            texto += f"▪ {dados['qtd']}x {nome}\n"
        
        texto += "──────────────────\n"
        texto += f" *TOTAL ESTIMADO: R$ {subtotal_acumulado:,.2f}*".replace(",", "X").replace(".", ",").replace("X", ".")
        texto += "\n\n_Aguardo confirmação para pagamento._"

        # 6. Gera URL
        url = f"https://wa.me/{settings.WHATSAPP_NUMERO}?text={quote_plus(texto, encoding='utf-8')}"

        return Response({"whatsapp_url": url})