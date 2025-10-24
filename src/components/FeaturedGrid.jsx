import React from "react";
import { useNavigate } from "react-router-dom";

const featuredItems = [
    { img: "/images/kit1.jpg", name: "Kit Sonhos", price: "R$ 31,00" },
    { img: "/images/kit2.jpg", name: "Kit Elegância", price: "R$ 45,00" },
    { img: "/images/kit3.jpg", name: "Kit Romance", price: "R$ 52,00" },
    { img: "/images/kit4.jpg", name: "Kit Alegria", price: "R$ 28,00" }
];

export default function FeaturedGrid() {
    const navigate = useNavigate();

    const handleImageClick = () => navigate("/KitDetalhes");
    const handleRentClick = () => navigate("/KitDetalhes");
    const handleSeeMoreClick = () => navigate("/Kits");

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
                {featuredItems.map((item, idx) => (
                    <div
                        key={idx}
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            textAlign: "center",
                            padding: "10px",
                            transition: "transform 0.3s",
                            cursor: "pointer",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                        <img
                            src={item.img}
                            alt={item.name}
                            onClick={handleImageClick}
                            style={{
                                width: "100%",
                                height: "150px",
                                objectFit: "cover",
                                borderRadius: "5px",
                                marginBottom: "10px"
                            }}
                        />
                        <h4>{item.name}</h4>
                        <p>{item.price}</p>
                        <button className="green" onClick={handleRentClick}>
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
