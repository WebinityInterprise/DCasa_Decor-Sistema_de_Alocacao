import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function KitDetalhes() {
  const navigate = useNavigate();

  const itensDoKit = [
    { nome: "Pratos de Natal Verde", quantidade: "7", preco: "R$ 50,00", img: "/images/kit1.jpg", imagensCarrossel: ["/images/kit1a.jpg", "/images/kit1b.jpg"] },
    { nome: "Prato Principal", quantidade: "7", preco: "R$ 10,00", img: "/images/kit2.jpg", imagensCarrossel: ["/images/kit2a.jpg", "/images/kit2b.jpg"] },
    { nome: "Prato de Sobremesa", quantidade: "7", preco: "R$ 6,00", img: "/images/kit3.jpg", imagensCarrossel: ["/images/kit3a.jpg", "/images/kit3b.jpg"] },
    { nome: "Pratos de Natal Vermelho", quantidade: "7", preco: "R$ 5,00", img: "/images/kit4.jpg", imagensCarrossel: ["/images/kit4a.jpg", "/images/kit4b.jpg"] },
  ];

  const [kitSelecionado, setKitSelecionado] = useState(itensDoKit[0]);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mudarImagem = (direcao) => {
    if (direcao === "left") {
      setImagemAtual((prev) =>
        prev === 0 ? kitSelecionado.imagensCarrossel.length - 1 : prev - 1
      );
    } else {
      setImagemAtual((prev) =>
        prev === kitSelecionado.imagensCarrossel.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleItemClick = (index) => {
    setKitSelecionado(itensDoKit[index]);
    setImagemAtual(0);
  };

  const handleRentClick = () => {
    navigate("/Carrinho");
  };

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "5px 24px",
        fontFamily: "'Arial', sans-serif",
        color: "#333",
      }}
    >
      {/* Seção do carrossel e informações do kit */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "30px" : "60px",
          alignItems: "start",
          marginTop: "20px",
        }}
      >
        {/* Carrossel */}
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            margin: isMobile ? "0 auto" : "0",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#fff",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              border: "1px solid #eee",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px 0",
            }}
          >
            <img
              src={kitSelecionado.imagensCarrossel[imagemAtual]}
              alt={kitSelecionado.nome}
              style={{
                width: isMobile ? "90%" : "70%",
                height: "auto",
                borderRadius: "8px",
                objectFit: "cover",
                display: "block",
                margin: "0 auto",
                transition: "opacity 0.4s ease-in-out",
              }}
            />

            {["left", "right"].map((dir) => (
              <button
                key={dir}
                onClick={() => mudarImagem(dir)}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  [dir === "left" ? "left" : "right"]: "16px",
                  backgroundColor: "#6B774D",
                  color: "white",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "22px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  transition: "background-color 0.2s, transform 0.2s",
                  zIndex: 3,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#5b6843";
                  e.currentTarget.style.transform =
                    "translateY(-50%) scale(1.05)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#6B774D";
                  e.currentTarget.style.transform =
                    "translateY(-50%) scale(1)";
                }}
              >
                {dir === "left" ? "‹" : "›"}
              </button>
            ))}
          </div>
        </div>

        {/* Informações do kit */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxWidth: "100%",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "700",
              marginBottom: "0px",
              color: "#2B3A21",
            }}
          >
            Kit de Natal - {kitSelecionado.nome}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              justifyContent: isMobile ? "center" : "flex-start",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#555",
              }}
            >
              Código:
            </p>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "12px",
                backgroundColor: "#899662",
                color: "#fff",
                fontWeight: "600",
                fontSize: "12px",
              }}
            >
              123456789
            </span>
          </div>

            <div style={{ display: "flex", gap: "20px", flex: 1 }}>
            {/* Entrega */}
            <div style={{ flex: "1 1 50%", minWidth: "200px" }}>
                <p style={{ marginBottom: "6px", fontWeight: "500", color: "#555" }}>
                Entrega/Retirada
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                    type="date"
                    style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    }}
                />
                <select
                    style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    }}
                >
                    <option>Horário</option>
                    <option>18:00</option>
                    <option>22:00</option>
                </select>
                </div>
            </div>

            {/* Devolução */}
            <div style={{ flex: "1 1 50%", minWidth: "200px" }}>
                <p style={{ marginBottom: "6px", fontWeight: "500", color: "#555" }}>
                Devolução
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                    type="date"
                    style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    }}
                />
                <select
                    style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    }}
                >
                    <option>Horário</option>
                    <option>08:00</option>
                    <option>12:00</option>
                </select>
                </div>
            </div>
            </div>

          <p
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#2B3A21",
              marginTop: "10px",
            }}
          >
            R$1.500,00
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "-20px",
            }}
          >
            <button
              style={{
                backgroundColor: "#899662",
                color: "#fff",
                padding: "14px 40px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "16px",
                transition: "all 0.2s",
                width: isMobile ? "90%" : "80%",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#6e7b4f")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#899662")
              }
              onClick={handleRentClick}
            >
              ALUGAR KIT
            </button>
          </div>

          {/* Detalhes do kit */}
          <div style={{ marginTop: "-20px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "0px",
                color: "#2B3A21",
              }}
            >
              Detalhes do Kit
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#555",
                lineHeight: "1.6",
              }}
            >
              Mini Wedding Rústico Chic. Torne seu momento inesquecível com
              nosso Kit Especial, pensado para detalhes encantadores.
              <br />
              Não inclui bolo.
            </p>
          </div>
        </div>
      </section>

      {/* Itens do kit */}
      <section style={{ marginTop: "50px" }}>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "20px",
          }}
        >
          Itens do Kit
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          {itensDoKit.map((item, index) => (
            <div
              key={index}
              style={{
                textAlign: "center",
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                backgroundColor: "#fff",
                cursor: "pointer",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 8px 16px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 4px 8px rgba(0,0,0,0.05)";
              }}
              onClick={() => handleItemClick(index)}
            >
              <img
                src={item.img}
                alt={item.nome}
                style={{
                  borderRadius: "8px",
                  marginBottom: "12px",
                  width: "80%",
                  objectFit: "cover",
                  transition: "transform 0.3s",
                }}
              />
              <p style={{ fontSize: "14px", color: "#777" }}>{item.nome}</p>
              <p style={{ fontWeight: "600", marginBottom: "4px" }}>
                {item.quantidade}x{item.preco}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
