import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

export default function MeusPedidos() {
  const [codigo, setCodigo] = useState("");
  const [pedidoEncontrado, setPedidoEncontrado] = useState(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleBuscar = async () => {
    if (!codigo.trim()) return;

    setLoading(true);
    setErro("");
    setPedidoEncontrado(null);

    try {
      const response = await fetch(`${apiUrl}/pedido/carrinho/consultar/${codigo.trim().toUpperCase()}/`);

      if (response.ok) {
        const data = await response.json();
        setPedidoEncontrado(data);
      } else {
        setErro("Pedido não encontrado ou código inválido.");
      }
    } catch (error) {
      console.error("Erro ao buscar pedido:", error);
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ textAlign: "center", fontSize: "26px", fontWeight: "700", marginBottom: "30px" }}>
        Meus Pedidos
      </h1>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", gap: "10px" }}>
        <input
          type="text"
          placeholder="Digite o código (Ex: 72QYIEB736)"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          style={{ padding: "10px", width: "300px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <button
          onClick={handleBuscar}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#899662",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "..." : <FiSearch />}
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
          <div style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
            <h2 style={{ fontSize: "18px", margin: 0 }}>
              Pedido: <span style={{ color: "#899662" }}>#{pedidoEncontrado.token}</span>
            </h2>
            <p style={{ margin: "5px 0", fontSize: "14px" }}>
              Status:{" "}
              <span
                style={{
                  color:
                    pedidoEncontrado.status === "PENDENTE" ? "#f0ad4e" :
                      pedidoEncontrado.status === "PAGO" ? "#5bc0de" :
                        pedidoEncontrado.status === "SEPARANDO" ? "#5bc0de" :
                          pedidoEncontrado.status === "PRONTO PARA RETIRADA" ? "#0275d8" :
                            pedidoEncontrado.status === "CONCLUÍDO" ? "#5cb85c" :
                              pedidoEncontrado.status === "CANCELADO" ? "#d9534f" :
                                "#000",
                  fontWeight: "bold",
                }}
              >
                {pedidoEncontrado.status}
              </span>
            </p>
            <p style={{ fontSize: "13px", color: "#666" }}>
              Cliente: {pedidoEncontrado.cliente?.nome} | Evento: {pedidoEncontrado.data_evento || "N/A"}
            </p>
          </div>

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
            <span>Unitário</span>
            <span>Subtotal</span>
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
                {/* EXIBIÇÃO DA IMAGEM ATUALIZADA */}
                <img
                  src={item.produto_imagem || "https://via.placeholder.com/70x70?text=Sem+Foto"}
                  alt={item.produto_nome}
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border: "1px solid #eee"
                  }}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/70x70?text=Erro+Foto"; }}
                />
                <div>
                  <p style={{ fontWeight: "600", margin: "0", fontSize: "14px" }}>{item.produto_nome}</p>
                </div>
              </div>

              <p style={{ fontSize: "14px" }}>{item.quantidade}</p>
              <p style={{ fontSize: "14px" }}>R$ {Number(item.preco_unitario).toFixed(2)}</p>
              <p style={{ fontSize: "14px", fontWeight: "600" }}>R$ {Number(item.subtotal).toFixed(2)}</p>
            </div>
          ))}

          <div style={{ textAlign: "right", marginTop: "16px", fontWeight: "700", fontSize: "18px", color: "#2B3A21" }}>
            Total: R$ {Number(pedidoEncontrado.total).toFixed(2)}
          </div>
        </div>
      )}
    </main>
  );
}