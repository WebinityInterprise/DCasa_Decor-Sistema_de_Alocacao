import React from "react";
import { FiSearch, FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate(); // 👈 Hook para navegação

    return (
        <div>
            <nav style={{ borderBottom: "1px solid #ccc", padding: "10px 0", background: "#fff" }}>
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    
                    {/* Logo como botão */}
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                        }}
                    >
                        <img
                            src="/images/logo.png"
                            alt="Logo"
                            style={{ height: "75px", display: "block" }}
                        />
                    </button>

                    {/* Barra de pesquisa */}
                    <div style={{ position: "relative", flex: 1, marginLeft: "20px", marginRight: "20px" }}>
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            style={{
                                width: "80%",
                                height: "50px",
                                padding: "0 15px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                                fontSize: "16px",
                            }}
                        />
                        <button
                            style={{
                                position: "absolute",
                                right: "calc(20% + 10px)",
                                top: "50%",
                                transform: "translateY(-50%)",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <FiSearch size={20} />
                        </button>
                    </div>

                    {/* Conta e Carrinho */}
                    <div style={{ display: "flex", gap: "20px" }}>
                        <a href="#">Minha conta</a>
                        <a href="/Carrinho"><FiShoppingCart /> Carrinho(0)</a>
                    </div>
                </div>
            </nav>

            <div style={{ backgroundColor: "#6b7b44", height: "50px", marginBottom: "20px" }}></div>
        </div>
    );
}
