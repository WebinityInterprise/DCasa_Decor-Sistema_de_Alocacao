import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function CarouselHome() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Imagens locais de reserva (caso a API falhe ou a lista venha vazia)
  const fallbackImages = [
    { url: "/images/carousel1.jpg", nomeEvento: "Bem-vindo" },
    { url: "/images/carousel2.jpg", nomeEvento: "Confira nossas ofertas" },
    { url: "/images/carousel3.jpg", nomeEvento: "Faça seu evento" },
  ];

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // 1. Aponta para o novo endpoint de banners
        const response = await fetch(`${apiUrl}/produto/banners/`);
        
        if (!response.ok) {
           throw new Error("Falha ao buscar banners");
        }

        const data = await response.json();

        // 2. Verifica se é um array e tem itens
        if (Array.isArray(data) && data.length > 0) {
          const apiImages = data
            .filter((banner) => banner.imagem) // Garante que tem URL da imagem
            .map((banner) => ({
              url: banner.imagem,      // Mapeia o campo 'imagem' da API
              nomeEvento: banner.titulo || "" // Mapeia o campo 'titulo' da API
            }));

          setImages(apiImages);
        } else {
          // Se a lista vier vazia [], usa o fallback
          setImages(fallbackImages);
        }
      } catch (error) {
        console.error("Erro ao carregar banners, usando locais:", error);
        setImages(fallbackImages);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [apiUrl]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    centerMode: true,
    centerPadding: "40px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          centerPadding: "20px",
        },
      },
      {
        breakpoint: 768,
        settings: {
          centerMode: false,
          centerPadding: "0px",
        },
      },
    ],
  };

  if (loading) {
    return (
      <div
        style={{
          height: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Carregando...
      </div>
    );
  }

  // Se não houver imagens nem na API nem no fallback, não renderiza nada
  if (images.length === 0) return null;

  return (
    <>
      <style>
        {`
          .slick-slide > div {
            padding: 0 10px;
            box-sizing: border-box;
          }

          @media (max-width: 768px) {
            .slick-slide > div {
              padding: 0 5px;
            }
          }
        `}
      </style>

      <div style={{ margin: "20px 0" }}>
        <div style={{ width: "95%", margin: "0 auto" }}>
          <Slider {...settings}>
            {images.map((imgObj, idx) => (
              <div key={idx}>
                <div
                  style={{
                    width: "100%",
                    height: "500px",
                    margin: "0 auto",
                    borderRadius: "6px",
                    overflow: "hidden",
                    position: "relative",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  <img
                    src={imgObj.url}
                    alt={imgObj.nomeEvento || `Banner ${idx}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {imgObj.nomeEvento && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "20px",
                        left: "20px",
                        color: "white",
                        backgroundColor: "rgba(0,0,0,0.4)", // Fundo semi-transparente para leitura
                        padding: "5px 15px",
                        borderRadius: "4px",
                        fontSize: "24px", // Ajustei um pouco o tamanho
                        fontWeight: "bold",
                        textShadow: "1px 1px 2px black"
                      }}
                    >
                      {imgObj.nomeEvento}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </>
  );
}