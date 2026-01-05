import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EventGrid() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  
  // Pega a URL do .env
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchEventosDestaque = async () => {
      try {
        const response = await fetch(`${apiUrl}/produto/eventos/?destaque=true`);
        
        if (!response.ok) throw new Error("Erro ao buscar eventos");

        const data = await response.json();
        const lista = data.results || data;
        setEventos(lista);
      } catch (error) {
        console.error("Erro:", error);
      }
    };

    fetchEventosDestaque();
  }, [apiUrl]);

  const handleVejaMais = () => {
    navigate("/Eventos");
  };

  const handleCardClick = (id) => {
    navigate(`/evento/${id}`);
  };

  if (eventos.length === 0) return null;

  return (
    <div className="container">
      <h2 className="event-title">
        <span>
          EVENTOS EM DESTAQUE
          <span className="event-title-line"></span>
        </span>
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px",
        }}
      >
        {eventos.map((event) => (
          <div
            key={event.id}
            onClick={() => handleCardClick(event.id)}
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              textAlign: "center",
              padding: "10px",
              transition: "transform 0.3s",
              cursor: "pointer",
              backgroundColor: "#fff"
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <img
              src={event.imagem || "/images/placeholder.jpg"}
              alt={event.nome}
              style={{
                width: "100%",
                height: "250px", // altura maior
                objectFit: "cover",
                borderRadius: "5px",
              }}
            />
            <h4 style={{ margin: "15px 0 5px", color: "#3F471C" }}>
              {event.nome}
            </h4>
            <p style={{ margin: "0 0 15px", fontWeight: "600" }}>
              {event.preco_formatado || `R$ ${event.preco}`}
            </p>
            <button className="green">Ver mais</button>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "40px", marginBottom: "40px" }}>
        <button className="green" onClick={handleVejaMais}>
          Veja mais estilos
        </button>
      </div>

      <div style={{ backgroundColor: "#6b7b44", height: "1px", marginBottom: "20px" }}></div>
    </div>
  );
}
