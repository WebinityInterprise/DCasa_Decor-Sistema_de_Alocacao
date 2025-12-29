import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const images = [
    "/images/carousel1.jpg",
    "/images/carousel2.jpg",
    "/images/carousel3.jpg"
];

export default function CarouselHome() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        centerMode: true,
        centerPadding: "100px", // padrão para telas grandes
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    centerPadding: "60px", // levemente maior em tablets
                }
            },
            {
                breakpoint: 768,
                settings: {
                    centerMode: false,    // desativa centralização
                    slidesToShow: 1,      // só uma imagem visível
                    centerPadding: "0",   // ocupa toda a largura
                }
            },
            {
                breakpoint: 480,
                settings: {
                    centerMode: false,
                    slidesToShow: 1,
                    centerPadding: "0",   // ocupa 100% da largura
                }
            }
        ]
    };

    return (
        <div style={{ margin: "20px 0" }}>
            <div style={{ width: "80%", margin: "0 auto" }}> {/* largura padrão */}
                <Slider {...settings}>
                    {images.map((img, idx) => (
                        <div key={idx} style={{ padding: "0 10px", boxSizing: "border-box" }}>
                            <img
                                src={img}
                                alt={`Slide ${idx}`}
                                style={{
                                    width: "100%",   // ocupa toda largura do slide
                                    height: "auto",
                                    maxHeight: "500px",
                                    borderRadius: "5px",
                                    objectFit: "cover"
                                }}
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
}
