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
from drf_spectacular.types import OpenApiTypes

from produto.models import Produto, Kit
from pedido.models import Cliente, Pedido, ItemPedido, MovimentoEstoque
from pedido.api.serializers import (
    CarrinhoSerializer,
    PedidoSerializer,
    PedidoCreateSerializer,
    AdicionarCarrinhoSerializer,
    PedidoStatusSerializer
)

def gerar_token_aleatorio(length=8):
    caracteres = string.ascii_uppercase + string.digits
    return ''.join(random.choices(caracteres, k=length))

class CarrinhoViewSet(viewsets.ViewSet):

    @extend_schema(
        summary="Visualizar carrinho (Produtos e Kits)",
        responses=CarrinhoSerializer
    )
    def list(self, request):
        """
        Retorna todos os itens do carrinho (kits e produtos misturados).
        """
        carrinho_prod = request.session.get("carrinho_produtos", {})
        carrinho_kits = request.session.get("carrinho_kits", {})
        dados_agendamento = request.session.get("dados_agendamento", {})
        
        lista_itens = []
        total_geral = 0

        # 1. Processar Produtos Individuais
        for pid, qtd in carrinho_prod.items():
            try:
                produto = Produto.objects.get(id=pid)
                subtotal = produto.preco * qtd
                total_geral += subtotal
                
                img_url = request.build_absolute_uri(produto.imagem.url) if produto.imagem else ""

                lista_itens.append({
                    "id": f"prod_{produto.id}",
                    "tipo": "produto",
                    "original_id": produto.id,
                    "codigo": produto.codigo,
                    "nome": produto.nome,
                    "imagem": img_url,
                    "quantidade": qtd,
                    "preco_unitario": produto.preco,
                    "subtotal": subtotal,
                })
            except Produto.DoesNotExist:
                continue

        # 2. Processar Kits
        for kid, qtd in carrinho_kits.items():
            try:
                kit = Kit.objects.get(id=kid)
                subtotal = kit.preco * qtd
                total_geral += subtotal

                img_url = request.build_absolute_uri(kit.imagem.url) if kit.imagem else ""

                lista_itens.append({
                    "id": f"kit_{kit.id}",
                    "tipo": "kit",
                    "original_id": kit.id,
                    "codigo": kit.codigo,
                    "nome": kit.nome,
                    "imagem": img_url,
                    "quantidade": qtd,
                    "preco_unitario": kit.preco,
                    "subtotal": subtotal,
                })
            except Kit.DoesNotExist:
                continue

        return Response({
            "produtos": lista_itens, 
            "total": total_geral,
            "agendamento": dados_agendamento
        })

    @extend_schema(
        summary="Adicionar PRODUTO ao carrinho",
        request=AdicionarCarrinhoSerializer,
        responses=CarrinhoSerializer
    )
    @action(detail=True, methods=["post"])
    def adicionar(self, request, pk=None):
        produto = get_object_or_404(Produto, pk=pk)
        serializer = AdicionarCarrinhoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quantidade = serializer.validated_data["quantidade"]

        carrinho_prod = request.session.get("carrinho_produtos", {})
        
        pid = str(produto.id)
        qtd_atual = carrinho_prod.get(pid, 0)
        nova_qtd = qtd_atual + quantidade

        if nova_qtd > produto.quantidade:
             return Response(
                {"error": f"Estoque insuficiente. Disponível: {produto.quantidade}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        carrinho_prod[pid] = nova_qtd
        request.session["carrinho_produtos"] = carrinho_prod
        request.session.modified = True

        return self.list(request)

    @extend_schema(
        summary="Adicionar KIT ao carrinho",
        request=AdicionarCarrinhoSerializer,
        responses=CarrinhoSerializer
    )
    @action(detail=True, methods=["post"], url_path="adicionar-kit")
    def adicionar_kit(self, request, pk=None):
        kit = get_object_or_404(Kit, pk=pk)
        serializer = AdicionarCarrinhoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        quantidade_kits = serializer.validated_data["quantidade"]
        
        # Salva datas na sessão se fornecidas
        data_retirada = serializer.validated_data.get('data_retirada')
        data_devolucao = serializer.validated_data.get('data_devolucao')

        if data_retirada and data_devolucao:
            request.session['dados_agendamento'] = {
                'data_retirada': str(data_retirada),
                'data_devolucao': str(data_devolucao)
            }

        # Validação de Estoque do Kit
        for produto in kit.produtos.all():
            # Considerando 1 unidade de cada produto por kit
            if produto.quantidade < quantidade_kits:
                return Response(
                    {"error": f"Não há estoque suficiente do item '{produto.nome}' para montar este kit."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        carrinho_kits = request.session.get("carrinho_kits", {})
        kid = str(kit.id)
        carrinho_kits[kid] = carrinho_kits.get(kid, 0) + quantidade_kits
        
        request.session["carrinho_kits"] = carrinho_kits
        request.session.modified = True

        return self.list(request)

    @extend_schema(
        summary="Editar quantidade de um item (Produto ou Kit)",
        request=AdicionarCarrinhoSerializer,
        responses=CarrinhoSerializer
    )
    @action(detail=False, methods=["patch"], url_path=r"editar/(?P<item_id>[^/.]+)")
    def editar(self, request, item_id=None):
        """
        Altera a quantidade de um item no carrinho.
        item_id deve ser o ID composto (ex: 'prod_1' ou 'kit_2').
        Body: { "quantidade": 5 }
        """
        serializer = AdicionarCarrinhoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        nova_quantidade = serializer.validated_data["quantidade"]

        carrinho_prod = request.session.get("carrinho_produtos", {})
        carrinho_kits = request.session.get("carrinho_kits", {})

        # Lógica para PRODUTO
        if item_id.startswith("prod_"):
            pid = item_id.split("_")[1]
            produto = get_object_or_404(Produto, id=pid)
            
            if produto.quantidade < nova_quantidade:
                return Response(
                    {"error": f"Estoque insuficiente. Disponível: {produto.quantidade}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            carrinho_prod[pid] = nova_quantidade
            request.session["carrinho_produtos"] = carrinho_prod

        # Lógica para KIT
        elif item_id.startswith("kit_"):
            kid = item_id.split("_")[1]
            kit = get_object_or_404(Kit, id=kid)

            # Valida estoque de todos os itens do kit
            for produto in kit.produtos.all():
                if produto.quantidade < nova_quantidade:
                    return Response(
                        {"error": f"Estoque insuficiente do item '{produto.nome}' no kit."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            carrinho_kits[kid] = nova_quantidade
            request.session["carrinho_kits"] = carrinho_kits

        else:
            return Response({"error": "ID inválido"}, status=status.HTTP_400_BAD_REQUEST)

        request.session.modified = True
        return self.list(request)

    @extend_schema(summary="Remover item do carrinho")
    @action(detail=False, methods=["delete"], url_path=r"remover/(?P<item_id>[^/.]+)")
    def remover(self, request, item_id=None):
        """
        Remove um item baseado no ID composto (ex: 'prod_1' ou 'kit_5').
        """
        carrinho_prod = request.session.get("carrinho_produtos", {})
        carrinho_kits = request.session.get("carrinho_kits", {})

        if item_id.startswith("prod_"):
            real_id = item_id.split("_")[1]
            if real_id in carrinho_prod:
                del carrinho_prod[real_id]
                request.session["carrinho_produtos"] = carrinho_prod
        
        elif item_id.startswith("kit_"):
            real_id = item_id.split("_")[1]
            if real_id in carrinho_kits:
                del carrinho_kits[real_id]
                request.session["carrinho_kits"] = carrinho_kits

        request.session.modified = True
        return self.list(request)

    @extend_schema(
        summary="Finalizar pedido (Checkout)",
        request=PedidoCreateSerializer,
        responses={201: PedidoSerializer},
        examples=[
            OpenApiExample(
                "Exemplo Completo com Endereço",
                summary="Exemplo de cliente com endereço e entrega",
                description="Use este JSON para testar a finalização de um pedido com entrega.",
                value={
                    "nome": "Maria Oliveira",
                    "email": "maria.cliente@email.com",
                    "telefone": "(11) 99999-8888",
                    "endereco": "Avenida Paulista",
                    "numero": "1578",
                    "bairro": "Bela Vista",
                    "cidade": "São Paulo",
                    "estado": "SP",
                    "cep": "01310-200",
                    "tipo_entrega": "ENTREGA",
                    "data_retirada": "2025-12-20",
                    "data_devolucao": "2026-12-22",
                    "data_evento": "2026-12-21",
                    "hora_evento": "19:30"
                },
                request_only=True,
            )
        ]
    )
    @action(detail=False, methods=["post"], url_path="finalizar")
    @transaction.atomic 
    def finalizar(self, request):
        serializer = PedidoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        carrinho_prod = request.session.get("carrinho_produtos", {})
        carrinho_kits = request.session.get("carrinho_kits", {})

        if not carrinho_prod and not carrinho_kits:
            return Response({"error": "Carrinho vazio"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Cria/Obtém Cliente
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

        # 2. Cria Pedido
        pedido = Pedido.objects.create(
            cliente=cliente,
            token=gerar_token_aleatorio(10),
            status="PENDENTE",
            tipo_entrega=data["tipo_entrega"],
            data_retirada=data["data_retirada"],
            data_devolucao=data["data_devolucao"],
            data_evento=data.get("data_evento"),
            hora_evento=data.get("hora_evento")
        )

        # 3. Processa Produtos Individuais
        for pid, qtd in carrinho_prod.items():
            produto = get_object_or_404(Produto, id=pid)
            if produto.quantidade < qtd:
                 raise serializers.ValidationError(f"Estoque insuficiente para {produto.nome}")
            
            ItemPedido.objects.create(
                pedido=pedido,
                produto=produto,
                quantidade=qtd,
                preco_unitario=produto.preco
            )
            produto.quantidade -= qtd
            produto.save()
            MovimentoEstoque.objects.create(produto=produto, tipo="SAIDA", quantidade=qtd, motivo=f"Pedido {pedido.id}")

        # 4. Processa Kits
        for kid, qtd_kits in carrinho_kits.items():
            kit = get_object_or_404(Kit, id=kid)
            
            # Baixa estoque dos itens dentro do kit
            for produto_do_kit in kit.produtos.all():
                qtd_total_produto = qtd_kits 
                
                if produto_do_kit.quantidade < qtd_total_produto:
                    raise serializers.ValidationError(f"Estoque insuficiente para {produto_do_kit.nome} (dentro do {kit.nome})")

                ItemPedido.objects.create(
                    pedido=pedido,
                    produto=produto_do_kit,
                    quantidade=qtd_total_produto,
                    preco_unitario=produto_do_kit.preco 
                )
                
                produto_do_kit.quantidade -= qtd_total_produto
                produto_do_kit.save()
                MovimentoEstoque.objects.create(produto=produto_do_kit, tipo="SAIDA", quantidade=qtd_total_produto, motivo=f"Pedido {pedido.id} (Kit {kit.nome})")

        # Limpa sessão
        request.session["carrinho_produtos"] = {}
        request.session["carrinho_kits"] = {}
        request.session.modified = True

        return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)

    @extend_schema(summary="Consultar status do pedido")
    @action(detail=False, methods=["get"], url_path=r"consultar/(?P<codigo>[A-Z0-9]+)")
    def consultar(self, request, codigo=None):
        pedido = get_object_or_404(Pedido, token=codigo)
        serializer = PedidoStatusSerializer(pedido)
        return Response(serializer.data)

    @extend_schema(summary="Gerar link WhatsApp")
    @action(detail=True, methods=["get"])
    def whatsapp(self, request, pk=None):
        pedido = get_object_or_404(Pedido, pk=pk)
        cliente = pedido.cliente
        
        texto = f"*Novo Pedido #{pedido.token}*\n\n"
        texto += f"Cliente: {cliente.nome}\n"
        texto += f"Data Evento: {pedido.data_evento}\n\n"
        texto += "*Itens:*\n"
        for item in pedido.itens.all():
            texto += f"- {item.quantidade}x {item.produto.nome if item.produto else 'Item'}\n"
        
        texto += f"\n*Total: R$ {pedido.total:.2f}*"
        
        url = f"https://wa.me/{settings.WHATSAPP_NUMERO}?text={urllib.parse.quote(texto)}"
        return Response({"whatsapp_url": url})