import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function CarouselHome() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${apiUrl}/produto/kits/?destaque=true`);
        const data = await response.json();

        const apiImages = data
          .filter((kit) => kit.imagem)
          .map((kit) => ({
            url: kit.imagem,
            nomeEvento: kit.nomeEvento || kit.nome || "",
          }));

        if (apiImages.length === 0) {
          setImages([
            { url: "/images/carousel1.jpg", nomeEvento: "Evento 1" },
            { url: "/images/carousel2.jpg", nomeEvento: "Evento 2" },
            { url: "/images/carousel3.jpg", nomeEvento: "Evento 3" },
          ]);
        } else {
          setImages(apiImages);
        }
      } catch (error) {
        console.error("Erro ao carregar banners:", error);
        setImages([
          { url: "/images/carousel1.jpg", nomeEvento: "Evento 1" },
          { url: "/images/carousel2.jpg", nomeEvento: "Evento 2" },
          { url: "/images/carousel3.jpg", nomeEvento: "Evento 3" },
        ]);
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
    centerPadding: "40px", // reduzido para slides mais largos
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

  if (images.length === 0) return null;

  return (
    <>
      {/* CSS para slides mais largos */}
      <style>
        {`
          .slick-slide > div {
            padding: 0 10px; /* menos padding para slides mais largos */
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
        <div
          style={{
            width: "95%", // aumenta largura do container
            margin: "0 auto",
          }}
        >
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
                    alt={`Banner Destaque ${idx}`}
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
                        bottom: "10px",
                        left: "10px",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        fontSize: "36px",
                        fontWeight: "bold",
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
