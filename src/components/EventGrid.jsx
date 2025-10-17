import React from "react";

const events = [
    { img: "/images/event1.jpg", name: "Estilo de Evento", price: "R$ 1.500,00" },
    { img: "/images/event2.jpg", name: "Estilo de Evento", price: "R$ 1.500,00" },
    { img: "/images/event3.jpg", name: "Estilo de Evento", price: "R$ 1.500,00" },
    { img: "/images/event4.jpg", name: "Estilo de Evento", price: "R$ 1.500,00" },
    { img: "/images/event1.jpg", name: "Estilo de Evento", price: "R$ 1.500,00" },
    // { img: "/images/event2.jpg", name: "Estilo de Evento", price: "R$ 1.500,00" },
    // { img: "/images/event3.jpg", name: "Estilo de Evento", price: "R$ 1.500,00" },
    // { img: "/images/event4.jpg", name: "Estilo de Evento", price: "R$ 1.500,00" },
    // { img: "/images/event3.jpg", name: "Estilo de Evento", price: "R$ 1.500,00" },
    // { img: "/images/event4.jpg", name: "Estilo de Evento", price: "R$ 1.500,00" }
];

export default function EventGrid() {
    return (
        <div className="container">
            {/* Título estilizado */}
            <h2 className="event-title">
                <span>
                    EVENTOS
                    <span className="event-title-line"></span>
                </span>
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px" }}>
                {events.map((event, idx) => (
                    <div key={idx} style={{
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        textAlign: "center",
                        padding: "10px",
                        transition: "transform 0.3s",
                        cursor: "pointer"
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    >
                        <img src={event.img} alt={event.name} style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "5px" }} />
                        <h4 style={{ margin: "15px 0 5px", color: "#3F471C" }}>{event.name}</h4>
                        <p style={{ margin: "0 0 15px", fontWeight: "600" }}>{event.price}</p>
                        <button className="green">Ver mais</button>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "40px", marginBottom: "40px" }}>
                <button className="green">Veja mais estilos</button>
            </div>

            <div style={{ backgroundColor: "#6b7b44", height: "1px", marginBottom: "20px" }}></div>
        </div>
    );
}
