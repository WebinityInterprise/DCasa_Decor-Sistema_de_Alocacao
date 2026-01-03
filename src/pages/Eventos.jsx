import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Eventos() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Busca eventos da API
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch(`${apiUrl}/produto/eventos/`);
        if (!response.ok) throw new Error("Erro ao buscar eventos");
        
        const data = await response.json();
        const listaEventos = data.results || data; // Trata paginação ou lista direta

        setEventos(listaEventos);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, [apiUrl]);

  const handleVerDetalhes = (id) => {
    // Redireciona para a nova página de detalhes
    navigate(`/evento/${id}`);
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Carregando eventos...</div>;

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ textAlign: "center", fontSize: "28px", fontWeight: "700", marginBottom: "40px", color: "#2B3A21" }}>
        NOSSOS PACOTES DE EVENTOS
      </h1>

      {eventos.map((evento) => (
        <section key={evento.id} style={{ marginBottom: "80px", textAlign: "center", borderBottom: "1px solid #eee", paddingBottom: "40px" }}>
          
          {/* Título do Evento */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <span style={{ flex: 1, height: "1px", backgroundColor: "#899662", marginRight: "10px", maxWidth: "100px" }}></span>
            <h2 style={{ fontSize: "22px", color: "#2B3A21", fontWeight: "600", textTransform: "uppercase" }}>
              {evento.nome}
            </h2>
            <span style={{ flex: 1, height: "1px", backgroundColor: "#899662", marginLeft: "10px", maxWidth: "100px" }}></span>
          </div>

          <p style={{ color: "#666", marginBottom: "20px", maxWidth: "600px", margin: "0 auto 20px" }}>
            {evento.descricao} | Capacidade: <strong>{evento.capacidade_pessoas} pessoas</strong>
          </p>

          {/* Imagem Principal do Evento */}
          <div 
            onClick={() => handleVerDetalhes(evento.id)}
            style={{ 
              cursor: "pointer", 
              marginBottom: "20px", 
              overflow: "hidden", 
              borderRadius: "10px",
              maxWidth: "600px",
              margin: "0 auto 20px"
            }}
          >
            <img 
              src={evento.imagem || "/images/placeholder.jpg"} 
              alt={evento.nome} 
              style={{ width: "100%", height: "300px", objectFit: "cover", transition: "transform 0.3s" }}
              onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseOut={(e) => e.target.style.transform = "scale(1)"}
            />
          </div>

          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#2B3A21", marginBottom: "15px" }}>
            {evento.preco_formatado || `R$ ${evento.preco}`}
          </p>

          <button
            onClick={() => handleVerDetalhes(evento.id)}
            style={{
              backgroundColor: "#899662",
              color: "#fff",
              padding: "12px 40px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "16px",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#6e7b4f")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#899662")}
          >
            VER DETALHES E ALUGAR
          </button>
        </section>
      ))}
    </main>
  );
}