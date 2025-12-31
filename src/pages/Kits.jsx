import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Kits() {
  const navigate = useNavigate();
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);

  // URL base do arquivo .env
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchKits = async () => {
      try {
        const response = await fetch(`${apiUrl}/produto/kits/`);
        
        if (!response.ok) {
          throw new Error("Erro ao buscar kits");
        }

        const data = await response.json();

        // --- CORREÇÃO AQUI ---
        // Se a API retornar paginado (com 'results'), pegamos o results.
        // Se retornar direto (lista), pegamos o data.
        if (data.results) {
            setKits(data.results);
        } else {
            setKits(data);
        }

      } catch (error) {
        console.error("Erro na API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKits();
  }, [apiUrl]);

  const handleImagemClick = (kitId) => {
    navigate(`/KitDetalhes/${kitId}`); 
  };

  const handleAlugarClick = async (kitId) => {
    try {
      const response = await fetch(`${apiUrl}/pedido/carrinho/${kitId}/adicionar-kit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantidade: 1 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/Carrinho");
      } else {
        alert(data.error || "Não foi possível adicionar o kit ao carrinho.");
      }
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      alert("Erro de conexão. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#2B3A21" }}>
        <h2>Carregando kits...</h2>
      </div>
    );
  }

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
            borderBottom: "1px solid #eee",
            paddingBottom: "40px"
          }}
        >
          {/* Cabeçalho do Kit */}
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
                fontSize: "22px",
                color: "#2B3A21",
                fontWeight: "600",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
                margin: "0 10px"
              }}
            >
              {kit.nome}
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

          {/* Grid de Produtos do Kit */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", 
              gap: "20px",
              justifyContent: "center",
              alignItems: "stretch",
              marginBottom: "30px",
            }}
          >
            {kit.produtos && kit.produtos.map((produto) => (
              <div
                key={produto.id}
                style={{
                  textAlign: "center",
                  border: "1px solid #eee",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  transition: "transform 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onClick={() => handleImagemClick(kit.id)}
              >
                <div>
                    <img
                    src={produto.imagem}
                    alt={produto.nome}
                    style={{
                        borderRadius: "8px",
                        marginBottom: "12px",
                        width: "100%",
                        height: "140px",
                        objectFit: "cover",
                    }}
                    />
                    <p style={{ fontWeight: "600", marginBottom: "4px", fontSize: "14px" }}>
                    {produto.nome}
                    </p>
                </div>
              </div>
            ))}
          </div>

          {/* Rodapé do Kit (Preço e Botão) */}
          <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              marginTop: "10px" 
          }}>
            <p style={{ 
                fontSize: "20px", 
                fontWeight: "bold", 
                color: "#2B3A21", 
                marginBottom: "15px" 
            }}>
                Valor do Kit: {kit.preco_formatado || `R$ ${kit.preco}`}
            </p>

            <button
              onClick={() => handleAlugarClick(kit.id)}
              style={{
                backgroundColor: "#899662",
                color: "#fff",
                padding: "14px 50px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "16px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                transition: "background 0.3s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#6E7B45"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#899662"}
            >
              ALUGAR KIT COMPLETO
            </button>
          </div>
        </section>
      ))}
    </main>
  );
}