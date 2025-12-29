import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

// Simulando pedidos com kits completos
const pedidos = [
  {
    codigo: "KIT001",
    status: "Reservado",
    itens: [
      { id: 1, nome: "Vaso com pé branco 12cm", preco: 6, qtd: 2, imagem: "/images/kit1.jpg" },
      { id: 2, nome: "Prato de sobremesa floral", preco: 5, qtd: 1, imagem: "/images/kit3.jpg" },
      { id: 3, nome: "Taça vermelha decorada", preco: 5, qtd: 4, imagem: "/images/kit8.jpg" },
    ],
  },
  {
    codigo: "KIT002",
    status: "Alugado",
    itens: [
      { id: 4, nome: "Vaso verde 15cm", preco: 6, qtd: 3, imagem: "/images/kit5.jpg" },
      { id: 5, nome: "Vaso dourado 18cm", preco: 8, qtd: 1, imagem: "/images/kit6.jpg" },
    ],
  },
  {
    codigo: "KIT003",
    status: "Devolvido",
    itens: [
      { id: 6, nome: "Prato azul cerâmica", preco: 7, qtd: 2, imagem: "/images/kit7.jpg" },
      { id: 7, nome: "Vaso prateado moderno", preco: 9, qtd: 1, imagem: "/images/kit9.jpg" },
    ],
  },
];


export default function MeusPedidos() {
  const [codigo, setCodigo] = useState("");
  const [pedidoEncontrado, setPedidoEncontrado] = useState(null);
  const [erro, setErro] = useState("");

  const handleBuscar = () => {
    const pedido = pedidos.find(
      (p) => p.codigo.toUpperCase() === codigo.trim().toUpperCase()
    );
    if (pedido) {
      setPedidoEncontrado(pedido);
      setErro("");
    } else {
      setPedidoEncontrado(null);
      setErro("Pedido não encontrado.");
    }
  };

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ textAlign: "center", fontSize: "26px", fontWeight: "700", marginBottom: "30px" }}>
        Meus Pedidos
      </h1>

      {/* Busca do pedido */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", gap: "10px" }}>
        <input
          type="text"
          placeholder="Digite o código do pedido"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          style={{ padding: "10px", width: "300px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <button
          onClick={handleBuscar}
          style={{
            padding: "10px 20px",
            backgroundColor: "#899662",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          <FiSearch />
        </button>
      </div>

      {erro && <p style={{ color: "red", textAlign: "center" }}>{erro}</p>}

      {pedidoEncontrado && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "#fff",
            marginTop: "20px",
          }}
        >
          <h2 style={{ marginBottom: "16px" }}>
            Código do Pedido: {pedidoEncontrado.codigo} | Status:{" "}
            <span
              style={{
                color:
                  pedidoEncontrado.status === "Reservado"
                    ? "#f0ad4e"
                    : pedidoEncontrado.status === "Alugado"
                    ? "#5cb85c"
                    : pedidoEncontrado.status === "Devolvido"
                    ?"#0275d8"
                    : "#000",
                fontWeight: "600",
              }}
            >
              {pedidoEncontrado.status}
            </span>
          </h2>

          {/* Grid de itens do kit */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              fontWeight: "600",
              fontSize: "14px",
              borderBottom: "1px solid #899662",
              paddingBottom: "8px",
              marginBottom: "8px",
            }}
          >
            <span>Item</span>
            <span>Qtd</span>
            <span>Preço</span>
            <span>Total</span>
          </div>

          {pedidoEncontrado.itens.map((item) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                alignItems: "center",
                borderBottom: "1px solid #eee",
                padding: "10px 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src={item.imagem}
                  alt={item.nome}
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
                <div>
                  <p style={{ fontWeight: "600", margin: "4px 0" }}>{item.nome}</p>
                </div>
              </div>

              <p>{item.qtd}</p>
              <p>xR${item.preco.toFixed(2)}</p>
              <p>R${(item.qtd * item.preco).toFixed(2)}</p>
            </div>
          ))}

          {/* Preço total do kit */}
          <div style={{ textAlign: "right", marginTop: "16px", fontWeight: "700", fontSize: "16px" }}>
            Total do Pedido: R$
            {pedidoEncontrado.itens
              .reduce((acc, item) => acc + item.qtd * item.preco, 0)
              .toFixed(2)}
          </div>
        </div>
      )}
    </main>
  );
}
