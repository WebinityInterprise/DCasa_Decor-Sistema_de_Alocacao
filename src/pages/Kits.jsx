import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const kits = [
  {
    id: 1,
    titulo: "KIT FESTA INFANTIL",
    imagens: ["/images/kit1.jpg", "/images/kit2.jpg", "/images/kit3.jpg", "/images/kit4.jpg"],
  },
  {
    id: 2,
    titulo: "KIT CASAMENTO",
    imagens: ["/images/kit5.jpg", "/images/kit6.jpg", "/images/kit7.jpg", "/images/kit8.jpg"],
  },
  {
    id: 3,
    titulo: "KIT JANTAR ELEGANTE",
    imagens: ["/images/kit9.jpg", "/images/kit10.jpg", "/images/kit11.jpg", "/images/kit12.jpg"],
  },
];

export default function Kits() {
  const navigate = useNavigate();

  const handleImagemClick = (kitId) => {
    navigate("/KitDetalhes"); // Aqui você poderia passar o id se quiser detalhes dinâmicos
  };

  const handleAlugarClick = () => {
    navigate("/Carrinho");
  };

  return (
    <main
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "40px 24px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "700",
          marginBottom: "40px",
          color: "#2B3A21",
        }}
      >
        KITS DISPONÍVEIS
      </h1>

      {kits.map((kit) => (
        <section
          key={kit.id}
          style={{
            marginBottom: "80px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                flex: 1,
                height: "1px",
                backgroundColor: "#899662",
                marginRight: "10px",
                maxWidth: "100px",
              }}
            ></span>
            <h2
              style={{
                fontSize: "20px",
                color: "#2B3A21",
                fontWeight: "600",
                whiteSpace: "nowrap",
              }}
            >
              {kit.titulo}
            </h2>
            <span
              style={{
                flex: 1,
                height: "1px",
                backgroundColor: "#899662",
                marginLeft: "10px",
                maxWidth: "100px",
              }}
            ></span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            {kit.imagens.map((img, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  border: "1px solid #eee",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onClick={() => handleImagemClick(kit.id)} // Direciona para KitDetalhes
              >
                <img
                  src={img}
                  alt={kit.titulo}
                  style={{
                    borderRadius: "8px",
                    marginBottom: "12px",
                    width: "80%",
                    objectFit: "cover",
                  }}
                />
                <p style={{ fontWeight: "600", marginBottom: "4px" }}>Prato</p>
                <p style={{ fontSize: "14px", color: "#777" }}>5x R$ 15,00</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
            <button
              onClick={handleAlugarClick} // Direciona para Carrinho
              style={{
                backgroundColor: "#899662",
                color: "#fff",
                padding: "14px 40px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "16px",
              }}
            >
              ALUGAR KIT
            </button>
          </div>
        </section>
      ))}
    </main>
  );
}
