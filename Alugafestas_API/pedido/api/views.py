from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.db import transaction
import urllib.parse
import random
import string
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
        Recebe: {"itens": [{"id": "kit_1", "tipo": "kit", "original_id": 1, "quantidade": 1}, ...]}
        """
        itens_local = request.data.get("itens", [])
        lista_formatada = []
        total_geral = 0

        for item in itens_local:
            tipo = item.get("tipo")
            orig_id = item.get("original_id")
            quantidade = int(item.get("quantidade", 1))

            try:
                if tipo == "kit":
                    obj = Kit.objects.get(id=orig_id)
                else:
                    obj = Produto.objects.get(id=orig_id)

                preco = float(obj.preco)
                subtotal = preco * quantidade
                total_geral += subtotal
                
                img_url = request.build_absolute_uri(obj.imagem.url) if obj.imagem else ""

                lista_formatada.append({
                    "id": item.get("id"), # ID gerado no front
                    "tipo": tipo,
                    "original_id": orig_id,
                    "codigo": obj.codigo,
                    "nome": obj.nome,
                    "imagem": img_url,
                    "quantidade": quantidade,
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

        # Itens vêm diretamente do body enviados pelo React
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

        # 3. Processar Itens (Produtos e Kits)
        for item in itens_carrinho:
            orig_id = item.get("original_id")
            qtd_item = int(item.get("quantidade", 1))

            if item.get("tipo") == "kit":
                kit = get_object_or_404(Kit, id=orig_id)
                # Baixa estoque dos itens dentro do kit
                for produto_kit in kit.produtos.all():
                    if produto_kit.quantidade < qtd_item:
                        raise serializers.ValidationError(f"Estoque insuficiente para {produto_kit.nome}")
                    
                    ItemPedido.objects.create(
                        pedido=pedido,
                        produto=produto_kit,
                        quantidade=qtd_item,
                        preco_unitario=produto_kit.preco
                    )
                    produto_kit.quantidade -= qtd_item
                    produto_kit.save()
                    MovimentoEstoque.objects.create(
                        produto=produto_kit, tipo="SAIDA", 
                        quantidade=qtd_item, motivo=f"Pedido {pedido.token} (Kit {kit.nome})"
                    )
            else:
                produto = get_object_or_404(Produto, id=orig_id)
                if produto.quantidade < qtd_item:
                    raise serializers.ValidationError(f"Estoque insuficiente para {produto.nome}")
                
                ItemPedido.objects.create(
                    pedido=pedido,
                    produto=produto,
                    quantidade=qtd_item,
                    preco_unitario=produto.preco
                )
                produto.quantidade -= qtd_item
                produto.save()
                MovimentoEstoque.objects.create(
                    produto=produto, tipo="SAIDA", 
                    quantidade=qtd_item, motivo=f"Pedido {pedido.token}"
                )

        return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)
    @extend_schema(summary="Gerar link WhatsApp")
    @action(detail=True, methods=["get"])
    def whatsapp(self, request, pk=None):
        pedido = get_object_or_404(Pedido, pk=pk)
        cliente = pedido.cliente
        
        # Formatação das datas para o padrão brasileiro (DD/MM/AAAA)
        data_evento = pedido.data_evento.strftime('%d/%m/%Y') if pedido.data_evento else "Não informada"
        data_retirada = pedido.data_retirada.strftime('%d/%m/%Y') if pedido.data_retirada else "N/A"
        data_devolucao = pedido.data_devolucao.strftime('%d/%m/%Y') if pedido.data_devolucao else "N/A"

        # Tradução do tipo de entrega para o texto da mensagem
        tipo_entrega_txt = "Retirada na Loja" if pedido.tipo_entrega == "RETIRADA" else "Entrega no Endereço"

        # Montagem da mensagem formatada
        texto = f"*Novo Pedido #{pedido.token}*\n\n"
        texto += f"👤 *Cliente:* {cliente.nome}\n"
        texto += f"📞 *Telefone:* {cliente.telefone}\n\n"
        texto += f"🚚 *entega:* {pedido.tipo_entrega}\n"
        texto += f"🗓️ *Período de Aluguel:*\n"
        texto += f"📅 Retirada: {data_retirada}\n"
        texto += f"📅 Devolução: {data_devolucao}\n\n"
        
        texto += f"📍 *Evento:* {data_evento}\n"
        texto += f"🚚 *Opção:* {tipo_entrega_txt}\n"
        
        # Se for entrega, você pode opcionalmente adicionar o bairro/cidade aqui
        if pedido.tipo_entrega == "ENTREGA":
            texto += f"🏠 *Bairro:* {cliente.bairro}\n"
        
        texto += "\n📦 *Itens:*\n"
        for item in pedido.itens.all():
            # Verifica se o produto existe para evitar erros
            nome_prod = item.produto.nome if item.produto else "Item"
            texto += f"- {item.quantidade}x {nome_prod}\n"
        
        texto += f"\n💰 *Total Estimado: R$ {pedido.total:.2f}*"
        
        # Codifica o texto para ser usado em uma URL
        url = f"https://wa.me/{settings.WHATSAPP_NUMERO}?text={urllib.parse.quote(texto)}"
        
        return Response({"whatsapp_url": url})