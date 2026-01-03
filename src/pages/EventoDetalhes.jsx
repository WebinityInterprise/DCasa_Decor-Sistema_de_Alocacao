import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EventoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  // Estados do formulário de aluguel
  const [dataRetirada, setDataRetirada] = useState("");
  const [dataDevolucao, setDataDevolucao] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("RETIRADA");

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Busca detalhes do evento específico
  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const response = await fetch(`${apiUrl}/produto/eventos/${id}/`);
        if (!response.ok) throw new Error("Evento não encontrado");
        const data = await response.json();
        setEvento(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvento();
  }, [id, apiUrl]);

  const handleRentClick = () => {
    if (!dataRetirada || !dataDevolucao) {
      alert("Por favor, selecione as datas de Retirada e Devolução.");
      return;
    }

    // Objeto do evento para o carrinho
    const novoItem = {
      id: `evt_${id}`,
      tipo: "evento",
      original_id: id,
      quantidade: 1, // Eventos geralmente são alugados em qtd 1 (o pacote inteiro)
      data_retirada: dataRetirada,
      data_devolucao: dataDevolucao,
      tipo_entrega: tipoEntrega,
      nome: evento.nome,
      preco: evento.preco,
      imagem: evento.imagem || ""
    };

    // Lógica do Carrinho LocalStorage
    const carrinhoAtual = JSON.parse(localStorage.getItem("carrinho") || "[]");
    const index = carrinhoAtual.findIndex((item) => item.id === novoItem.id);

    if (index > -1) {
      carrinhoAtual[index] = { ...carrinhoAtual[index], ...novoItem };
    } else {
      carrinhoAtual.push(novoItem);
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinhoAtual));
    navigate("/Carrinho");
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Carregando...</div>;
  if (!evento) return <div style={{ textAlign: "center", padding: "50px" }}>Evento não encontrado.</div>;

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 24px", color: "#333", fontFamily: "Arial, sans-serif" }}>
      
      {/* Título e Imagem Principal */}
      <section style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", color: "#2B3A21", marginBottom: "10px" }}>{evento.nome}</h1>
        <p style={{ fontSize: "18px", color: "#666" }}>Capacidade: {evento.capacidade_pessoas} pessoas | Tipo: {evento.tipo_display}</p>
        
        <img 
            src={evento.imagem || "/images/placeholder.jpg"} 
            alt={evento.nome}
            style={{ 
                width: "100%", 
                maxWidth: "800px", 
                height: "400px", 
                objectFit: "cover", 
                borderRadius: "10px", 
                marginTop: "20px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }} 
        />
      </section>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "40px" }}>
        
        {/* COLUNA ESQUERDA: LISTA DE ITENS INCLUSOS */}
        <div>
            <h2 style={{ borderBottom: "2px solid #899662", paddingBottom: "10px", marginBottom: "20px", color: "#2B3A21" }}>
                ITENS INCLUSOS NESTE PACOTE
            </h2>
            <p style={{ marginBottom: "20px", fontStyle: "italic", color: "#555" }}>
                Este pacote contém todos os itens abaixo necessários para seu evento.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
                {evento.itens_evento && evento.itens_evento.map((item) => (
                    <div key={item.id} style={{ border: "1px solid #eee", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                        <img 
                            src={item.produto_detalhes.imagem} 
                            alt={item.produto_detalhes.nome}
                            style={{ width: "100%", height: "120px", objectFit: "contain", marginBottom: "10px" }}
                        />
                        <p style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "5px" }}>
                            {item.produto_detalhes.nome}
                        </p>
                        <span style={{ background: "#899662", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>
                            {item.quantidade} unidades
                        </span>
                    </div>
                ))}
            </div>
        </div>

        {/* COLUNA DIREITA: CARD DE ALUGUEL */}
        <div>
            <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ddd", position: "sticky", top: "20px" }}>
                <h3 style={{ marginTop: 0, color: "#2B3A21" }}>Reserve agora</h3>
                <p style={{ fontSize: "28px", fontWeight: "bold", color: "#2B3A21", margin: "10px 0" }}>
                    {evento.preco_formatado || `R$ ${evento.preco}`}
                </p>

                {/* Opção de Entrega */}
                <div style={{ marginBottom: "15px" }}>
                    <p style={{ marginBottom: "5px", fontWeight: "600", fontSize: "14px" }}>Entrega:</p>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <label style={{ fontSize: "13px" }}><input type="radio" checked={tipoEntrega === "RETIRADA"} onChange={() => setTipoEntrega("RETIRADA")} /> Retirar</label>
                        <label style={{ fontSize: "13px" }}><input type="radio" checked={tipoEntrega === "ENTREGA"} onChange={() => setTipoEntrega("ENTREGA")} /> Receber</label>
                    </div>
                </div>

                {/* Datas */}
                <div style={{ marginBottom: "15px" }}>
                    <p style={{ marginBottom: "5px", fontWeight: "600", fontSize: "14px" }}>Data Retirada:</p>
                    <input type="date" value={dataRetirada} onChange={(e) => setDataRetirada(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <p style={{ marginBottom: "5px", fontWeight: "600", fontSize: "14px" }}>Data Devolução:</p>
                    <input type="date" value={dataDevolucao} onChange={(e) => setDataDevolucao(e.target.value)} min={dataRetirada} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
                </div>

                <button 
                    onClick={handleRentClick}
                    style={{ 
                        width: "100%", 
                        background: "#899662", 
                        color: "#fff", 
                        border: "none", 
                        padding: "15px", 
                        borderRadius: "6px", 
                        fontSize: "16px", 
                        fontWeight: "bold", 
                        cursor: "pointer" 
                    }}
                >
                    ALUGAR PACOTE
                </button>
            </div>
        </div>

      </div>
    </main>
  );
}