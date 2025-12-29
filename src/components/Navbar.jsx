import React, { useState, useEffect } from "react";
import { FiSearch, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
      if (window.innerWidth > 900) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/Pesquisa?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div>
      {/* Fundo branco do navbar ocupa 100% */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #ccc",
          width: "100%",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          position: "relative",
          zIndex: 50,
        }}
      >
        {/* Conteúdo centralizado em 80% */}
        <nav
          style={{
            width: "80%",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px",
          }}
        >
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <img src="/images/logo2.png" alt="Logo" style={{ height: "75px" }} />
          </button>

          {/* Barra de pesquisa */}
          <form
            onSubmit={handleSearch}
            style={{
              position: "relative",
              flex: 1,
              marginLeft: "20px",
              marginRight: "20px",
            }}
          >
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "77%",
                height: "50px",
                padding: "0 15px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
            />
            <button
              type="submit"
              style={{
                position: "absolute",
                right: "calc(20% + 10px)",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <FiSearch size={20} />
            </button>
          </form>

          {/* Menu Desktop */}
          {!isMobile && (
            <div style={{ display: "flex", gap: "20px" }}>
              <a href="/MeusPedidos" style={{ textDecoration: "none", color: "#333" }}>
                Meus Pedidos
              </a>
              <a
                href="/Carrinho"
                style={{
                  textDecoration: "none",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <FiShoppingCart /> Carrinho(0)
              </a>
            </div>
          )}

          {/* Ícone Mobile */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
          )}
        </nav>

        {/* Menu Mobile suspenso */}
        {menuOpen && isMobile && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              width: "180px",
              borderRadius: "0 0 6px 6px",
            }}
          >
            <a
              href="#"
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid #eee",
                color: "#333",
              }}
            >
              Meus Pedidos
            </a>
            <a
              href="/Carrinho"
              style={{
                padding: "12px 20px",
                color: "#333",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FiShoppingCart /> Carrinho(0)
            </a>
          </div>
        )}
      </div>

      {/* Faixa verde ocupa 100% */}
      <div
        style={{
          backgroundColor: "#6b7b44",
          height: "50px",
          width: "100%",
          marginBottom: "20px",
        }}
      ></div>
    </div>
  );
}
