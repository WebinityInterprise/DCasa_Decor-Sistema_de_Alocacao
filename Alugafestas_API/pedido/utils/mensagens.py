from urllib.parse import quote_plus
from django.conf import settings

def mensagem_status_pedido(pedido):
    cliente = pedido.cliente

    # 1. Formatadores
    fmt_data = lambda d: d.strftime('%d/%m/%Y') if d else "N/A"
    fmt_hora = lambda h: h.strftime('%H:%M') if h else ""

    data_evento_str = fmt_data(pedido.data_evento)
    if pedido.hora_evento:
        data_evento_str += f" às {fmt_hora(pedido.hora_evento)}"

    # 2. Cabeçalho
    texto = (
        f"*PEDIDO #{pedido.token[:8]}*\n"
        f"Status: *{pedido.get_status_display()}*\n"
        f"──────────────────\n"
        f"*CLIENTE*\n"
        f"Nome: {cliente.nome}\n"
        f"Tel: {cliente.telefone}\n"
        f"Email: {cliente.email}\n\n"
    )

    # 3. Dados do aluguel
    texto += (
        f"*DADOS DO ALUGUEL*\n"
        f"Evento: {data_evento_str}\n"
        f"Retirada: {fmt_data(pedido.data_retirada)}\n"
        f"Devolução: {fmt_data(pedido.data_devolucao)}\n\n"
    )

    # 4. Entrega
    tipo_txt = "Receber em Casa" if pedido.tipo_entrega == "ENTREGA" else "Retirar na Loja"
    texto += f"*Entrega*: {tipo_txt}\n"

    if pedido.tipo_entrega == "ENTREGA":
        texto += (
            f"{cliente.endereco}, {cliente.numero}\n"
            f"{cliente.bairro} - {cliente.cidade}/{cliente.estado}\n"
            f"CEP: {cliente.cep}\n"
        )

    texto += "──────────────────\n"
    texto += "*ITENS RESERVADOS*\n"

    # 5. Itens
    itens_agrupados = {}
    total = 0

    for item in pedido.itens.all():
        nome = item.produto.nome if item.produto else "Item removido"
        qtd = item.quantidade_estoque
        valor = item.preco_unitario * qtd

        if nome in itens_agrupados:
            itens_agrupados[nome]['qtd'] += qtd
            itens_agrupados[nome]['valor'] += valor
        else:
            itens_agrupados[nome] = {'qtd': qtd, 'valor': valor}

        total += valor

    for nome, dados in itens_agrupados.items():
        texto += f"▪ {dados['qtd']}x {nome}\n"

    texto += "──────────────────\n"
    texto += f"*TOTAL ESTIMADO: R$ {total:,.2f}*".replace(",", "X").replace(".", ",").replace("X", ".")

    return texto
