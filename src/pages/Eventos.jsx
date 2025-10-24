import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const eventos = [
  {
    id: 1,
    titulo: "ESTILO DO EVENTO",
    imagens: [
      "/images/Evento1.jpg","/images/Evento2.jpg","/images/Evento3.jpg","/images/Evento4.jpg",
      "/images/Evento5.jpg","/images/Evento6.jpg","/images/Evento7.jpg","/images/Evento8.jpg",
      "/images/Evento9.jpg","/images/Evento10.jpg"
    ],
  },
  {
    id: 2,
    titulo: "ESTILO DO EVENTO",
    imagens: [
      "/images/Evento11.jpg","/images/Evento12.jpg","/images/Evento13.jpg","/images/Evento14.jpg",
      "/images/Evento15.jpg","/images/Evento16.jpg","/images/Evento17.jpg","/images/Evento18.jpg",
      "/images/Evento19.jpg","/images/Evento20.jpg"
    ],
  },
  // Adicione outros eventos conforme necessário
];

export default function Eventos() {
  const navigate = useNavigate();
  const [imagemAmpliada, setImagemAmpliada] = useState(null); 
  const [indices, setIndices] = useState(eventos.map(() => 0)); // índice atual do carrossel por evento

  const handleImagemClick = (img) => setImagemAmpliada(img);

  const handleFecharImagem = () => setImagemAmpliada(null);

  const handleAlugarEvento = () => {
    navigate("/KitDetalhes");
  };

  const handleNext = (eventoIndex) => {
    setIndices(prev => {
      const newIndices = [...prev];
      newIndices[eventoIndex] = (newIndices[eventoIndex] + 1) % eventos[eventoIndex].imagens.length;
      return newIndices;
    });
  };

  const handlePrev = (eventoIndex) => {
    setIndices(prev => {
      const newIndices = [...prev];
      newIndices[eventoIndex] = (newIndices[eventoIndex] - 1 + eventos[eventoIndex].imagens.length) % eventos[eventoIndex].imagens.length;
      return newIndices;
    });
  };

  return (
    <main style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ textAlign: "center", fontSize: "28px", fontWeight: "700", marginBottom: "40px", color: "#2B3A21" }}>
        EVENTOS
      </h1>

      {eventos.map((evento, idx) => (
        <section key={evento.id} style={{ marginBottom: "80px", textAlign: "center" }}>
          {/* Subtítulo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <span style={{ flex: 1, height: "1px", backgroundColor: "#899662", marginRight: "10px", maxWidth: "100px" }}></span>
            <h2 style={{ fontSize: "18px", color: "#2B3A21", fontWeight: "600", whiteSpace: "nowrap" }}>
              {evento.titulo}
            </h2>
            <span style={{ flex: 1, height: "1px", backgroundColor: "#899662", marginLeft: "10px", maxWidth: "100px" }}></span>
          </div>

          {/* Carrossel de imagens */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px" }}>
            <button
              onClick={() => handlePrev(idx)}
              style={{
                position: "absolute",
                left: "-40px",
                zIndex: 1,
                cursor: "pointer",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#6B774D", // cor de fundo
                color: "#fff", // cor do ícone
                border: "none",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              &#10094;
            </button>

            <img
              src={evento.imagens[indices[idx]]}
              alt={evento.titulo}
              style={{ width: "80%", borderRadius: "8px", cursor: "pointer", objectFit: "cover" }}
              onClick={() => handleImagemClick(evento.imagens[indices[idx]])}
            />

            <button
              onClick={() => handleNext(idx)}
              style={{
                position: "absolute",
                right: "-40px",
                zIndex: 1,
                cursor: "pointer",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#6B774D", // cor de fundo
                color: "#fff", // cor do ícone
                border: "none",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              &#10095;
            </button>
          </div>

          {/* Botão ALUGAR EVENTO */}
          <button
            onClick={handleAlugarEvento}
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
              width: "180px",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#6e7b4f")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#899662")}
          >
            ALUGAR EVENTO
          </button>
        </section>
      ))}

      {/* Modal de imagem ampliada */}
      {imagemAmpliada && (
        <div
          onClick={handleFecharImagem}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
            cursor: "zoom-out",
            padding: 0,
          }}
        >
          <img
            src={imagemAmpliada}
            alt="Imagem ampliada"
            style={{
              width: "90vw",
              height: "auto",
              maxHeight: "90vh",
              borderRadius: "10px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.8)",
              objectFit: "contain",
            }}
          />
        </div>
      )}
    </main>
  );
}
