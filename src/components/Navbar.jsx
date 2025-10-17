import React from "react";
import { FiSearch, FiShoppingCart } from "react-icons/fi";

export default function Navbar() {
    return (
        <nav style={{ borderBottom: "1px solid #ccc", padding: "10px 0", background: "#fff" }}>
            <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                
                {/* Logo */}
                <div>
                    <img src="/images/logo.png" alt="Logo" style={{ height: "75px" }} />
                </div>

                {/* Search Bar */}
                <div style={{ position: "relative", flex: 1, marginLeft: "20px", marginRight: "20px" }}>
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        style={{
                            width: "80%",            // Mantém o tamanho que você já tinha
                            height: "50px",
                            padding: "0 15px",       // Padding normal, sem aumentar artificialmente
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            fontSize: "16px"
                        }}
                    />
                    <button
                        style={{
                            position: "absolute",
                            right: "calc(20% + 10px)", // Posiciona o ícone exatamente dentro do input
                            top: "50%",
                            transform: "translateY(-50%)",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <FiSearch size={20} />
                    </button>
                </div>

                {/* Account & Cart */}
                <div style={{ display: "flex", gap: "20px" }}>
                    <a href="#">Minha conta</a>
                    <a href="#"><FiShoppingCart /> Carrinho(0)</a>
                </div>
            </div>
        </nav>
    );
}
