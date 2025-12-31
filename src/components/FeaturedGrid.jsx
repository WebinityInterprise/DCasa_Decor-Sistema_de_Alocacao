import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FeaturedGrid() {
    const navigate = useNavigate();
    const [destaques, setDestaques] = useState([]);
    const [loading, setLoading] = useState(true);

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchDestaques = async () => {
            try {
                // Chama o endpoint filtrando por destaque=true
                const response = await fetch(`${apiUrl}/produto/kits/?destaque=true`);
                const data = await response.json();

                // Trata paginação (se vier dentro de 'results', pega ele, senão pega direto)
                const listaKits = data.results ? data.results : data;

                setDestaques(listaKits);
            } catch (error) {
                console.error("Erro ao buscar destaques:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDestaques();
    }, [apiUrl]);

    // Função única para navegar para os detalhes
    const handleOpenDetails = (id) => {
        navigate(`/KitDetalhes/${id}`);
    };

    const handleSeeMoreClick = () => {
        navigate("/Kits");
    };

    if (loading) {
        return <div style={{ textAlign: "center", padding: "20px" }}>Carregando destaques...</div>;
    }

    // Se não houver destaques, esconde a seção para não ficar feio
    if (destaques.length === 0) return null;

    return (
        <div className="container">
            <h2 className="event-title">
                <span>
                    DESTAQUES
                    <span className="event-title-line"></span>
                </span>
            </h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "20px"
                }}
            >
                {/* 
                   .slice(0, 4) garante que mostre no máximo 4 itens na Home, 
                   mesmo que a API retorne mais.
                */}
                {destaques.slice(0, 4).map((item) => (
                    <div
                        key={item.id}
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            textAlign: "center",
                            padding: "10px",
                            transition: "transform 0.3s",
                            cursor: "pointer",
                            backgroundColor: "#fff"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        onClick={() => handleOpenDetails(item.id)}
                    >
                        <img
                            src={item.imagem}
                            alt={item.nome}
                            style={{
                                width: "100%",
                                height: "150px",
                                objectFit: "cover",
                                borderRadius: "5px",
                                marginBottom: "10px"
                            }}
                        />
                        <h4 style={{
                            fontSize: "16px",
                            margin: "10px 0",
                            color: "#333",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>
                            {item.nome}
                        </h4>

                        <p style={{ fontWeight: "bold", color: "#555", marginBottom: "10px" }}>
                            {item.preco_formatado || `R$ ${item.preco}`}
                        </p>

                        <button
                            className="green"
                            onClick={(e) => {
                                e.stopPropagation(); // Evita ativar o click do card e do botão ao mesmo tempo
                                handleOpenDetails(item.id);
                            }}
                        >
                            Alugar
                        </button>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "40px" }}>
                <button className="green" onClick={handleSeeMoreClick}>
                    Veja mais itens
                </button>
            </div>
        </div>
    );
}