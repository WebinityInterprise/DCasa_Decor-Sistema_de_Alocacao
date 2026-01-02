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

# Import para ignorar CSRF em APIs (necessário para POST/PATCH/DELETE)
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from produto.models import Produto, Kit
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

    @extend_schema(
        summary="Obter detalhes dos itens do LocalStorage",
        description="Recebe uma lista de itens do navegador e retorna dados atualizados do banco (preço, nome, imagem).",
    )
    @action(detail=False, methods=["post"], url_path="detalhes")
    def detalhes(self, request):
        """
        Recebe: {"itens": [{"id": "kit_1", "tipo": "kit", "original_id": 1, "quantidade_estoque": 1}, ...]}
        """
        itens_local = request.data.get("itens", [])
        lista_formatada = []
        total_geral = 0

        for item in itens_local:
            tipo = item.get("tipo")
            orig_id = item.get("original_id")
            quantidade_estoque = int(item.get("quantidade_estoque", 1))

            try:
                if tipo == "kit":
                    obj = Kit.objects.get(id=orig_id)
                else:
                    obj = Produto.objects.get(id=orig_id)

                preco = float(obj.preco)
                subtotal = preco * quantidade_estoque
                total_geral += subtotal
                
                img_url = request.build_absolute_uri(obj.imagem.url) if obj.imagem else ""

                lista_formatada.append({
                    "id": item.get("id"), # ID gerado no front
                    "tipo": tipo,
                    "original_id": orig_id,
                    "codigo": obj.codigo,
                    "nome": obj.nome,
                    "imagem": img_url,
                    "quantidade": quantidade_estoque,
                    "preco_unitario": preco,
                    "subtotal": subtotal,
                    # Devolvemos as datas para manter o estado no front
                    "data_retirada": item.get("data_retirada"),
                    "data_devolucao": item.get("data_devolucao"),
                })
            except (Kit.DoesNotExist, Produto.DoesNotExist):
                continue

        return Response({
            "produtos": lista_formatada, 
            "total": total_geral
        })
    @extend_schema(
        summary="Consultar pedido pelo código alfanumérico",
        description="Busca os detalhes de um pedido utilizando o token gerado (ex: 72QYIEB736)."
    )
    @action(detail=False, methods=["get"], url_path=r"consultar/(?P<codigo>[A-Z0-9]+)")
    def consultar_pedido(self, request, codigo=None):
        # 1. Busca o pedido pelo token
        pedido = get_object_or_404(Pedido, token=codigo)
        
        # 2. IMPORTANTE: Passamos o context={'request': request}
        # Isso permite que o Serializer gere a URL completa da imagem
        serializer = PedidoSerializer(pedido, context={'request': request})
        
        return Response(serializer.data)
    @extend_schema(
        summary="Finalizar pedido (Checkout via LocalStorage)",
        request=PedidoCreateSerializer,
        responses={201: PedidoSerializer}
    )
    @action(detail=False, methods=["post"], url_path="finalizar")
    @transaction.atomic 
    
    def finalizar(self, request):
        """
        Recebe os dados do cliente + os itens do carrinho no corpo da requisição.
        """
        serializer = PedidoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        itens_carrinho = request.data.get("itens", [])

        if not itens_carrinho:
            return Response({"error": "O carrinho está vazio no navegador."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Criar/Obter Cliente
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

        # 2. Criar Pedido
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

        # 3. Processar Itens
        for item in itens_carrinho:
            orig_id = item.get("original_id")
            
            # No carrinho do Front pode vir como 'quantidade' ou 'quantidade_estoque'
            # Vamos garantir que pegamos o valor certo
            qtd_carrinho = int(item.get("quantidade", item.get("quantidade_estoque", 1)))

            if item.get("tipo") == "kit":
                kit = get_object_or_404(Kit, id=orig_id)
                
                for item_do_kit in kit.itens.all():
                    produto_real = item_do_kit.produto
                    
                    qtd_total_baixar = item_do_kit.quantidade * qtd_carrinho

                    # Verifica estoque (No Produto é 'quantidade_estoque')
                    if produto_real.quantidade_estoque < qtd_total_baixar:
                        raise serializers.ValidationError(f"Estoque insuficiente para {produto_real.nome}")
                    
        
                    
                    ItemPedido.objects.create(
                        pedido=pedido,
                        produto=produto_real,
                        quantidade_estoque=qtd_total_baixar, 
                        preco_unitario=produto_real.preco
                    )
                    
                    # Baixa Estoque (No Produto é 'quantidade_estoque')
                    produto_real.quantidade_estoque -= qtd_total_baixar
                    produto_real.save()
                    
                    # Movimento de Estoque (Aqui é 'quantidade')
                    MovimentoEstoque.objects.create(
                        produto=produto_real, tipo="SAIDA", 
                        quantidade=qtd_total_baixar, motivo=f"Pedido {pedido.token} (Kit {kit.nome})"
                    )
            else:
                produto = get_object_or_404(Produto, id=orig_id)
                
                # Verifica estoque
                if produto.quantidade_estoque < qtd_carrinho:
                    raise serializers.ValidationError(f"Estoque insuficiente para {produto.nome}")
                
                # Cria ItemPedido
                ItemPedido.objects.create(
                    pedido=pedido,
                    produto=produto,
                    quantidade_estoque=qtd_carrinho, # <--- CORRIGIDO AQUI
                    preco_unitario=produto.preco
                )
                
                # Baixa Estoque
                produto.quantidade_estoque -= qtd_carrinho
                produto.save()
                
                MovimentoEstoque.objects.create(
                    produto=produto, tipo="SAIDA", 
                    quantidade=qtd_carrinho, motivo=f"Pedido {pedido.token}"
                )

        return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)
    @extend_schema(summary="Gerar link WhatsApp")
    @action(detail=True, methods=["get"])
    def whatsapp(self, request, pk=None):
        pedido = get_object_or_404(Pedido, pk=pk)
        cliente = pedido.cliente

        data_evento = pedido.data_evento.strftime('%d/%m/%Y') if pedido.data_evento else "Não informada"
        data_retirada = pedido.data_retirada.strftime('%d/%m/%Y') if pedido.data_retirada else "N/A"
        data_devolucao = pedido.data_devolucao.strftime('%d/%m/%Y') if pedido.data_devolucao else "N/A"

        tipo_entrega_txt = "Retirada na Loja" if pedido.tipo_entrega == "RETIRADA" else "Entrega no Endereço"

        texto = (
            f"* Novo Pedido #{pedido.token}*\n\n"
            f" *Cliente:* {cliente.nome}\n"
            f" *Telefone:* {cliente.telefone}\n\n"
            f" *Entrega:* {tipo_entrega_txt}\n\n"
            f" *Período de Aluguel:*\n"
            f" Retirada: {data_retirada}\n"
            f" Devolução: {data_devolucao}\n\n"
            f" *Evento:* {data_evento}\n"
        )

        if pedido.tipo_entrega == "ENTREGA":
            texto += f" *Bairro:* {cliente.bairro}\n"

        texto += "\n *Itens Reservados:*\n"

        itens_resumo = {}
        for item in pedido.itens.all():
            nome = item.produto.nome if item.produto else "Item desconhecido"
            itens_resumo[nome] = itens_resumo.get(nome, 0) + item.quantidade_estoque

        for nome, qtd in itens_resumo.items():
            texto += f"• {qtd}x {nome}\n"

        valor_total = sum(
            item.preco_unitario * item.quantidade_estoque
            for item in pedido.itens.all()
        )

        texto += f"\n *Total Estimado: R$ {valor_total:.2f}*"

        url = f"https://wa.me/{settings.WHATSAPP_NUMERO}?text={quote_plus(texto, encoding='utf-8')}"

        return Response({"whatsapp_url": url})