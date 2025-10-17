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
        centerMode: true,       // mantém o slide centralizado
        centerPadding: "100px",  // metade do espaçamento desejado
    };

    return (
        <div style={{ margin: "20px 0" }}>
            {/* Faixa acima do carrossel */}
            <div style={{ backgroundColor: "#6b7b44", height: "50px", marginBottom: "20px" }}></div>

            {/* Carrossel centralizado com 80% de largura */}
            <div style={{ width: "80%", margin: "0 auto" }}>
                <Slider {...settings}>
                    {images.map((img, idx) => (
                        <div key={idx} style={{ padding: "0 10px", boxSizing: "border-box" }}>
                            <img
                                src={img}
                                alt={`Slide ${idx}`}
                                style={{ width: "100%", height: "400px", objectFit: "cover", borderRadius: "5px" }}
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
}
