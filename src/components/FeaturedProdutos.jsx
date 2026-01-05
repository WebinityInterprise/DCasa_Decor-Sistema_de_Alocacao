import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FeaturedProdutos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProdutosDestaque = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/produto/produtos/?destaque=true`
        );
        const data = await response.json();

        // Trata paginação
        const listaProdutos = data.results ? data.results : data;

        setProdutos(listaProdutos);
      } catch (error) {
        console.error("Erro ao buscar produtos em destaque:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutosDestaque();
  }, [apiUrl]);

  const handleOpenDetails = (id) => {
    navigate(`/ProdutoDetalhes/${id}`);
  };

  const handleSeeMoreClick = () => {
    navigate("/Produtos");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        Carregando produtos em destaque...
      </div>
    );
  }

  if (produtos.length === 0) return null;

  return (
    <div className="container">
      <h2 className="event-title">
        <span>
          PRODUTOS EM DESTAQUE
          <span className="event-title-line"></span>
        </span>
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Mostra no máximo 4 produtos */}
        {produtos.slice(0, 4).map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenDetails(item.id)}
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              textAlign: "center",
              padding: "10px",
              transition: "transform 0.3s",
              cursor: "pointer",
              backgroundColor: "#fff",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <img
              src={item.imagem}
              alt={item.nome}
              style={{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: "5px",
                marginBottom: "10px",
              }}
            />

            <h4
              style={{
                fontSize: "16px",
                margin: "10px 0",
                color: "#333",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.nome}
            </h4>

            <p
              style={{
                fontWeight: "bold",
                color: "#555",
                marginBottom: "10px",
              }}
            >
              {item.preco_formatado || `R$ ${item.preco}`}
            </p>

            <button
              className="green"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDetails(item.id);
              }}
            >
              Ver detalhes
            </button>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <button className="green" onClick={handleSeeMoreClick}>
          Veja mais produtos
        </button>
      </div>
    </div>
  );
}
