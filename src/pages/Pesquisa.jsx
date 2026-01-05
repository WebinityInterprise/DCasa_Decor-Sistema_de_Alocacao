import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Pesquisa() {
  const navigate = useNavigate();
  const location = useLocation();

  const apiUrl = import.meta.env.VITE_API_URL;

  // --- ESTADOS DOS FILTROS ---
  const [categoria, setCategoria] = useState("Todas");
  const [preco, setPreco] = useState(50);
  const [busca, setBusca] = useState("");
  const [cor, setCor] = useState("Todas");

  // --- ESTADOS DA LISTA E PAGINAÇÃO ---
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);

  const produtosPorPagina = 28;

  // --- VISIBILIDADE DO SIDEBAR MOBILE ---
  const [showFiltrosMobile, setShowFiltrosMobile] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryBusca = params.get("query");
    const queryCat = params.get("categoria");

    if (queryBusca) setBusca(queryBusca);
    if (queryCat) setCategoria(queryCat);
  }, [location.search]);

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", paginaAtual.toString());
        if (busca) params.append("q", busca);
        if (cor !== "Todas") params.append("cor", cor);
        if (categoria !== "Todas") params.append("categoria", categoria);
        if (preco > 0) params.append("preco_max", preco.toString());

        const response = await fetch(`${apiUrl}/produto/produtos/busca_produto/?${params.toString()}`);
        if (!response.ok) throw new Error("Erro na requisição");

        const data = await response.json();
        if (data.results) {
          setProdutos(data.results);
          setTotalResultados(data.count);
        } else {
          setProdutos(data);
          setTotalResultados(data.length);
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setProdutos([]);
        setTotalResultados(0);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchProdutos();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [busca, cor, categoria, preco, paginaAtual, apiUrl]);

  const handleCategoria = (cat) => { setCategoria(cat); setPaginaAtual(1); };
  const handleCor = (c) => { setCor(c === cor ? "Todas" : c); setPaginaAtual(1); };
  const handlePrecoChange = (e) => { setPreco(Number(e.target.value)); setPaginaAtual(1); };

  const handleAlugar = (item) => {
    const nomeCategoria = item.categoria?.nome?.toLowerCase() || "";
    const nomeProduto = item.nome?.toLowerCase() || "";
    const isKit = nomeCategoria.includes("kit") || nomeProduto.includes("kit");
    navigate(isKit ? `/KitDetalhes/${item.id}` : `/produto/${item.id}`);
  };

  const limparFiltros = () => {
    setPreco(500); setCategoria("Todas"); setBusca(""); setCor("Todas"); setPaginaAtual(1);
    navigate("/pesquisa");
    setShowFiltrosMobile(false);
  };

  const totalPaginas = Math.ceil(totalResultados / produtosPorPagina);

  const cores = [
    { nome: "branco", hex: "#ffffff" },
    { nome: "preto", hex: "#000000" },
    { nome: "verde", hex: "#6b7b44" },
    { nome: "rosa", hex: "#f4b6c2" },
    { nome: "azul", hex: "#4a90e2" },
    { nome: "vermelho", hex: "#d32f2f" },
    { nome: "amarelo", hex: "#fdd835" },
    { nome: "dourado", hex: "#d4af37" },
    { nome: "prateado", hex: "#c0c0c0" },
    { nome: "lilás", hex: "#c8a2c8" },
    { nome: "transparente", hex: "transparent" },
  ];

  return (
    <main style={{ display: "flex", flexDirection: "row", padding: "30px 20px", minHeight: "100vh", maxWidth: "1400px", margin: "0 auto", gap: "40px" }}>

      {/* --- SIDEBAR DESKTOP --- */}
      <aside
        style={{
          width: "250px",
          minWidth: "250px",
          borderRight: "1px solid #e5bcbc",
          paddingRight: "20px",
        }}
        className="sidebar-filtros desktop-only"
      >
        {/* Conteúdo dos filtros */}
        <div style={{ marginBottom: "20px" }}>
          <h3>BUSCAR</h3>
          <input type="text" value={busca} onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }} placeholder="Nome, código..." style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h3>PREÇO MÁXIMO</h3>
          <input type="range" min="0" max="500" value={preco} onChange={handlePrecoChange} style={{ width: "100%", accentColor: "#899662" }} />
          <p>Até R$ {preco},00</p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h3>CORES</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {cores.map((c) => (
              <button key={c.nome} onClick={() => handleCor(c.nome)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: cor === c.nome ? "3px solid #899662" : "1px solid #ccc",
                  cursor: "pointer",
                  background: c.nome === "transparente" ? "#f8f8f8 url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\" fill=\"%23ccc\"><rect width=\"5\" height=\"5\"/><rect x=\"5\" y=\"5\" width=\"5\" height=\"5\"/></svg>') repeat" : c.hex
                }}
                title={c.nome.charAt(0).toUpperCase() + c.nome.slice(1)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3>CATEGORIAS</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {["Todas", "Vasos", "Pratos", "Taças", "Kits", "Móveis"].map((cat) => (
              <button key={cat} onClick={() => handleCategoria(cat)}
                style={{
                  textAlign: "left",
                  backgroundColor: categoria === cat ? "#899662" : "transparent",
                  color: categoria === cat ? "#fff" : "#2B3A21",
                  border: "1px solid #899662",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button onClick={limparFiltros} style={{ marginTop: "30px", padding: "10px", width: "100%", backgroundColor: "#fff", border: "1px solid #ccc", color: "#555", borderRadius: "6px" }}>LIMPAR FILTROS</button>
      </aside>

      {/* --- ÁREA DE PRODUTOS --- */}
      <section style={{ flex: 1, position: "relative" }}>
        {/* BOTÃO FILTROS MOBILE */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }} className="mobile-only">
          <button onClick={() => setShowFiltrosMobile(true)} style={{ padding: "10px 20px", backgroundColor: "#899662", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            Filtros
          </button>
        </div>

        {/* LISTA DE PRODUTOS */}
        <p>{loading ? "Buscando..." : `${totalResultados} produto(s) encontrado(s)`}</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", // menor que antes
            gap: "20px",
          }}
        >
          {produtos.map((p) => (
            <div
              key={p.id}
              onClick={() => handleAlugar(p)}
              style={{
                border: "1px solid #eee",
                borderRadius: "8px",
                padding: "10px",
                textAlign: "center",
                backgroundColor: "#fff",
                transition: "transform 0.3s",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div>
                <img
                  src={p.imagem || "/placeholder.jpg"}
                  alt={p.nome}
                  style={{
                    width: "100%",
                    height: "150px", // menor altura como no FeaturedGrid
                    objectFit: "cover",
                    borderRadius: "5px",
                    // marginBottom: "10px",
                  }}
                />
                <p
                  style={{
                    fontWeight: "600",
                    fontSize: "14px", // menor fonte
                    color: "#333",
                    marginBottom: "4px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.nome}
                </p>
              </div>

              <div>
                <p
                  style={{
                    margin: "8px 0",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#2B3A21",
                  }}
                >
                  {p.preco_formatado || `R$ ${p.preco}`}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAlugar(p);
                  }}
                  style={{
                    backgroundColor: "#899662",
                    color: "#fff",
                    border: "none",
                    padding: "8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  ALUGAR
                </button>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* --- SIDEBAR MOBILE --- */}
      {showFiltrosMobile && (
        <aside className="sidebar-mobile">
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setShowFiltrosMobile(false)} style={{ fontSize: "20px", padding: "5px 10px", background: "none", border: "none", cursor: "pointer" }}>✕</button>
          </div>

          {/* Conteúdo dos filtros (mesmo que desktop) */}
          <div style={{ marginBottom: "20px" }}>
            <h3>PREÇO MÁXIMO</h3>
            <input type="range" min="0" max="5000" value={preco} onChange={handlePrecoChange} style={{ width: "100%", accentColor: "#899662" }} />
            <p>Até R$ {preco},00</p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3>CORES</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {cores.map((c) => (
                <button key={c.nome} onClick={() => handleCor(c.nome)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: cor === c.nome ? "3px solid #899662" : "1px solid #ccc",
                    cursor: "pointer",
                    background: c.nome === "transparente" ? "#f8f8f8 url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\" fill=\"%23ccc\"><rect width=\"5\" height=\"5\"/><rect x=\"5\" y=\"5\" width=\"5\" height=\"5\"/></svg>') repeat" : c.hex
                  }}
                  title={c.nome.charAt(0).toUpperCase() + c.nome.slice(1)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3>CATEGORIAS</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {["Todas", "Vasos", "Pratos", "Taças", "Kits", "Móveis"].map((cat) => (
                <button key={cat} onClick={() => handleCategoria(cat)}
                  style={{
                    textAlign: "left",
                    backgroundColor: categoria === cat ? "#899662" : "transparent",
                    color: categoria === cat ? "#fff" : "#2B3A21",
                    border: "1px solid #899662",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button onClick={limparFiltros} style={{ marginTop: "30px", padding: "10px", width: "100%", backgroundColor: "#fff", border: "1px solid #ccc", color: "#555", borderRadius: "6px" }}>LIMPAR FILTROS</button>
        </aside>
      )}

      {/* --- ESTILOS --- */}
      <style>
        {`
          /* Oculta sidebar desktop no mobile */
          @media (max-width: 768px) {
            .desktop-only {
              display: none;
            }
            .mobile-only {
              display: flex;
            }

            .sidebar-mobile {
              position: fixed;
              top: 0;
              right: 0;
              width: 250px;
              height: 100vh;
              background: #fff;
              padding: 20px;
              box-shadow: -2px 0 10px rgba(0,0,0,0.1);
              z-index: 1000;
              overflow-y: auto;
            }
          }
        `}
      </style>
    </main>
  );
}
