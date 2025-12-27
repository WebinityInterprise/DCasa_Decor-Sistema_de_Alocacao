from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
import urllib.parse
import random
import string
from drf_spectacular.utils import extend_schema, OpenApiExample
from produto.models import Produto
from pedido.models import Cliente, Pedido, ItemPedido
from pedido.api.serializers import (
    CarrinhoSerializer,
    CarrinhoItemSerializer,
    PedidoSerializer,
    PedidoCreateSerializer
    
)
from pedido.api.serializers import AdicionarCarrinhoSerializer, PedidoStatusSerializer
from drf_spectacular.utils import extend_schema
from drf_spectacular.types import OpenApiTypes


def gerar_token_aleatorio(length=8):
    caracteres = string.ascii_uppercase + string.digits
    return ''.join(random.choices(caracteres, k=length))


class CarrinhoViewSet(viewsets.ViewSet):

    @extend_schema(
        summary="Visualizar carrinho",
        responses=CarrinhoSerializer
    )
    def list(self, request):
        """GET /carrinho/ -> retorna o carrinho"""
        carrinho = request.session.get("carrinho", {})
        produtos = []
        total = 0
        for produto_id, quantidade in carrinho.items():
            produto = get_object_or_404(Produto, id=produto_id)
            subtotal = produto.preco * quantidade
            total += subtotal
            produtos.append({
                "id": produto.id,
                "nome": produto.nome,
                "quantidade": quantidade,
                "preco_unitario": produto.preco,
                "subtotal": subtotal,
            })
        return Response({"produtos": produtos, "total": total})

    @extend_schema(
        summary="Adicionar produto ao carrinho",
        request=AdicionarCarrinhoSerializer,
        responses=CarrinhoSerializer
    )
    @action(detail=True, methods=["post"])
    def adicionar(self, request, pk=None):
        """
        POST /carrinho/adicionar/<produto_id>/
        Body:
        {
            "quantidade": 2
        }
        """
        produto = get_object_or_404(Produto, pk=pk)

        serializer = AdicionarCarrinhoSerializer(
            data=request.data,
            context={"produto": produto}
        )
        serializer.is_valid(raise_exception=True)

        quantidade = serializer.validated_data["quantidade"]

        # carrinho por sessão (sem login)
        carrinho = request.session.get("carrinho", {})

        produto_id = str(produto.id)
        quantidade_atual = carrinho.get(produto_id, 0)

        # valida estoque considerando o que já está no carrinho
        if quantidade_atual + quantidade > produto.quantidade:
            return Response(
                {
                    "error": f"Estoque insuficiente. Disponível: {produto.quantidade}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        carrinho[produto_id] = quantidade_atual + quantidade
        request.session["carrinho"] = carrinho
        request.session.modified = True

        # monta retorno
        produtos = []
        total = 0

        for pid, qtd in carrinho.items():
            p = get_object_or_404(Produto, pk=pid)
            subtotal = p.preco * qtd
            total += subtotal
            produtos.append({
                "id": p.id,
                "nome": p.nome,
                "quantidade": qtd,
                "preco_unitario": p.preco,
                "subtotal": subtotal,
            })

        return Response(
            {
                "produtos": produtos,
                "total": total
            },
            status=status.HTTP_200_OK
        )
    @extend_schema(
    summary="Finalizar pedido (sem login)",
    request=PedidoCreateSerializer,
    responses={201: PedidoSerializer},
    examples=[
        OpenApiExample(
            "Exemplo de pedido",
            value={
                "nome": "João da Silva",
                "email": "joao@email.com",
                "telefone": "11999999999",
                "endereco": "Rua das Flores",
                "numero": "123",
                "bairro": "Centro",
                "cidade": "São Paulo",
                "estado": "SP",
                "cep": "01001-000",
                "data_evento": "2025-12-30",
                "hora_evento": "18:00"
            },
            request_only=True,
        )
    ],
)
    @action(
        detail=False,
        methods=["post"],
        url_path="finalizar"
    ) 
    def finalizar(self, request):
        serializer = PedidoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        carrinho = request.session.get("carrinho", {})
        if not carrinho:
            return Response({"error": "Carrinho vazio"}, status=status.HTTP_400_BAD_REQUEST)

        cliente, _ = Cliente.objects.get_or_create(
            email=data["email"],
            defaults={
                "nome": data["nome"],
                "telefone": data["telefone"],
                "endereco": data["endereco"],
                "numero": data["numero"],
                "bairro": data["bairro"],
                "cidade": data["cidade"],
                "estado": data["estado"],
                "cep": data["cep"],
            }
        )

        pedido = Pedido.objects.create(
            cliente=cliente,
            token=gerar_token_aleatorio(10),
            data_evento=data.get("data_evento"),
            hora_evento=data.get("hora_evento")
        )

        for produto_id, quantidade in carrinho.items():
            produto = get_object_or_404(Produto, id=produto_id)
            ItemPedido.objects.create(
                pedido=pedido,
                produto=produto,
                quantidade=quantidade,
                preco_unitario=produto.preco
            )

        request.session["carrinho"] = {}

        pedido_serializer = PedidoSerializer(pedido)
        return Response(pedido_serializer.data, status=status.HTTP_201_CREATED)
    @extend_schema(
    summary="Consultar status do pedido por código",
    responses=PedidoStatusSerializer
)
    @action(
        detail=False,
        methods=["get"],
        url_path=r"consultar/(?P<codigo>[A-Z0-9]+)"
    )
    def consultar(self, request, codigo=None):
        pedido = get_object_or_404(Pedido, token=codigo)

        serializer = PedidoStatusSerializer(pedido)
        return Response(serializer.data)

    @extend_schema(
        summary="Gerar link WhatsApp do pedido",
        responses=OpenApiTypes.OBJECT
    )

    @extend_schema(
        summary="Gerar link WhatsApp do pedido",
        responses=OpenApiTypes.OBJECT
    )
    @action(detail=True, methods=["get"])
    def whatsapp(self, request, pk=None):
        pedido = get_object_or_404(Pedido, pk=pk)
        cliente = pedido.cliente
        itens = pedido.itens.all()
        if not itens.exists():
            return Response({"error": "Pedido sem itens"}, status=status.HTTP_400_BAD_REQUEST)
        if not settings.WHATSAPP_NUMERO:
            return Response({"error": "WHATSAPP_NUMERO não configurado"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        produtos_texto = ""
        for item in itens:
            if not item.produto:
                produtos_texto += "- Produto removido\n"
            else:
                produtos_texto += f"- {item.produto.nome} (Qtd: {item.quantidade}) R$ {item.preco_unitario}\n"

        mensagem = f"""
*🛒 NOVO PEDIDO*

📦 Pedido Nº: {pedido.id}
🔐 Código: {pedido.token}
📌 Status: {pedido.status}

👤 Cliente: {cliente.nome}
📞 Telefone: {cliente.telefone}

📍 Endereço:
{cliente.endereco}, {cliente.numero}
{cliente.bairro} - {cliente.cidade}/{cliente.estado}
CEP: {cliente.cep}

🧾 Itens:
{produtos_texto}
💰 Total: R$ {pedido.total:.2f}
——————————————
"""
        whatsapp_url = f"https://wa.me/{settings.WHATSAPP_NUMERO}?text={urllib.parse.quote(mensagem)}"
        return Response({"whatsapp_url": whatsapp_url})
