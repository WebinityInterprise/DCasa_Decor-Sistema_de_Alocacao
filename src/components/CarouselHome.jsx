import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

export default function CarouselHome() {
    // Estado para guardar as imagens vindas da API
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pega a URL da API do .env
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                // Busca os KITS marcados como destaque
                const response = await fetch(`${apiUrl}/produto/kits/?destaque=true`);
                const data = await response.json();

                // Filtra apenas os kits que têm imagem e cria um array só de URLs
                // Se a API retornar menos de 3 itens, completamos com imagens estáticas de fallback
                const apiImages = data
                    .filter(kit => kit.imagem) // Pega só quem tem foto
                    .map(kit => kit.imagem);   // Extrai a URL da foto

                // Fallback: Se não tiver nenhum kit destaque, usa as imagens padrão
                if (apiImages.length === 0) {
                    setImages([
                        "/images/carousel1.jpg",
                        "/images/carousel2.jpg",
                        "/images/carousel3.jpg"
                    ]);
                } else {
                    setImages(apiImages);
                }

            } catch (error) {
                console.error("Erro ao carregar banners:", error);
                // Em caso de erro, usa imagens locais
                setImages([
                    "/images/carousel1.jpg",
                    "/images/carousel2.jpg",
                    "/images/carousel3.jpg"
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, [apiUrl]);

    const settings = {
        dots: true,
        infinite: true, // Se tiver poucas imagens, o infinite pode bugar, mas o slick trata bem
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        centerMode: true,
        centerPadding: "100px",
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    centerPadding: "60px",
                }
            },
            {
                breakpoint: 768,
                settings: {
                    centerMode: false,
                    slidesToShow: 1,
                    centerPadding: "0",
                }
            },
            {
                breakpoint: 480,
                settings: {
                    centerMode: false,
                    slidesToShow: 1,
                    centerPadding: "0",
                }
            }
        ]
    };

    if (loading) {
        return <div style={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>Carregando...</div>;
    }

    // Se por algum motivo o array estiver vazio (mesmo com fallback), não renderiza nada para não quebrar
    if (images.length === 0) return null;

    return (
        <div style={{ margin: "20px 0" }}>
            <div style={{ width: "80%", margin: "0 auto" }}> 
                <Slider {...settings}>
                    {images.map((img, idx) => (
                        <div key={idx} style={{ padding: "0 10px", boxSizing: "border-box", outline: "none" }}>
                            <div style={{ 
                                width: "100%", 
                                height: "500px", // Altura fixa para manter padrão
                                borderRadius: "5px",
                                overflow: "hidden",
                                backgroundColor: "#f0f0f0" // Fundo cinza enquanto carrega a imagem
                            }}>
                                <img
                                    src={img}
                                    alt={`Banner Destaque ${idx}`}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover", // Garante que a imagem preencha sem distorcer
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
}