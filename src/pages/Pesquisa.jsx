import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const produtos = [
  { id: 1, nome: "Vaso com pé branco 12cm", preco: 6, cor: "branco", categoria: "Vasos", imagem: "/images/kit1.jpg" },
  { id: 2, nome: "Vaso garrafa transparente 15cm", preco: 6, cor: "transparente", categoria: "Vasos", imagem: "/images/kit2.jpg" },
  { id: 3, nome: "Prato de sobremesa floral", preco: 5, cor: "rosa", categoria: "Pratos", imagem: "/images/kit3.jpg" },
  { id: 4, nome: "Taça transparente 12cm", preco: 4, cor: "transparente", categoria: "Taças", imagem: "/images/kit4.jpg" },
  { id: 5, nome: "Vaso verde 15cm", preco: 6, cor: "verde", categoria: "Vasos", imagem: "/images/kit5.jpg" },
  { id: 6, nome: "Vaso dourado 18cm", preco: 8, cor: "dourado", categoria: "Vasos", imagem: "/images/kit6.jpg" },
  { id: 7, nome: "Prato azul cerâmica", preco: 7, cor: "azul", categoria: "Pratos", imagem: "/images/kit7.jpg" },
  { id: 8, nome: "Taça vermelha decorada", preco: 5, cor: "vermelho", categoria: "Taças", imagem: "/images/kit8.jpg" },
  { id: 9, nome: "Vaso prateado moderno", preco: 9, cor: "prateado", categoria: "Vasos", imagem: "/images/kit9.jpg" },

  { id: 10, nome: "Vaso com pé branco 12cm", preco: 6, cor: "branco", categoria: "Vasos", imagem: "/images/kit1.jpg" },
  { id: 11, nome: "Vaso garrafa transparente 15cm", preco: 6, cor: "transparente", categoria: "Vasos", imagem: "/images/kit2.jpg" },
  { id: 12, nome: "Prato de sobremesa floral", preco: 5, cor: "rosa", categoria: "Pratos", imagem: "/images/kit3.jpg" },
  { id: 13, nome: "Taça transparente 12cm", preco: 4, cor: "transparente", categoria: "Taças", imagem: "/images/kit4.jpg" },
  { id: 14, nome: "Vaso verde 15cm", preco: 6, cor: "verde", categoria: "Vasos", imagem: "/images/kit5.jpg" },
  { id: 15, nome: "Vaso dourado 18cm", preco: 8, cor: "dourado", categoria: "Vasos", imagem: "/images/kit6.jpg" },
  { id: 16, nome: "Prato azul cerâmica", preco: 7, cor: "azul", categoria: "Pratos", imagem: "/images/kit7.jpg" },
  { id: 17, nome: "Taça vermelha decorada", preco: 5, cor: "vermelho", categoria: "Taças", imagem: "/images/kit8.jpg" },
  { id: 18, nome: "Vaso prateado moderno", preco: 9, cor: "prateado", categoria: "Vasos", imagem: "/images/kit9.jpg" },

  { id: 19, nome: "Vaso com pé branco 12cm", preco: 6, cor: "branco", categoria: "Vasos", imagem: "/images/kit1.jpg" },
  { id: 20, nome: "Vaso garrafa transparente 15cm", preco: 6, cor: "transparente", categoria: "Vasos", imagem: "/images/kit2.jpg" },
  { id: 21, nome: "Prato de sobremesa floral", preco: 5, cor: "rosa", categoria: "Pratos", imagem: "/images/kit3.jpg" },
  { id: 22, nome: "Taça transparente 12cm", preco: 4, cor: "transparente", categoria: "Taças", imagem: "/images/kit4.jpg" },
  { id: 23, nome: "Vaso verde 15cm", preco: 6, cor: "verde", categoria: "Vasos", imagem: "/images/kit5.jpg" },
  { id: 24, nome: "Vaso dourado 18cm", preco: 8, cor: "dourado", categoria: "Vasos", imagem: "/images/kit6.jpg" },
  { id: 25, nome: "Prato azul cerâmica", preco: 7, cor: "azul", categoria: "Pratos", imagem: "/images/kit7.jpg" },
  { id: 26, nome: "Taça vermelha decorada", preco: 5, cor: "vermelho", categoria: "Taças", imagem: "/images/kit8.jpg" },
  { id: 27, nome: "Vaso prateado moderno", preco: 9, cor: "prateado", categoria: "Vasos", imagem: "/images/kit9.jpg" },

  { id: 28, nome: "Vaso com pé branco 12cm", preco: 6, cor: "branco", categoria: "Vasos", imagem: "/images/kit1.jpg" },
  { id: 29, nome: "Vaso garrafa transparente 15cm", preco: 6, cor: "transparente", categoria: "Vasos", imagem: "/images/kit2.jpg" },
  { id: 30, nome: "Prato de sobremesa floral", preco: 5, cor: "rosa", categoria: "Pratos", imagem: "/images/kit3.jpg" },
  { id: 31, nome: "Taça transparente 12cm", preco: 4, cor: "transparente", categoria: "Taças", imagem: "/images/kit4.jpg" },
  { id: 32, nome: "Vaso verde 15cm", preco: 6, cor: "verde", categoria: "Vasos", imagem: "/images/kit5.jpg" },
  { id: 33, nome: "Vaso dourado 18cm", preco: 8, cor: "dourado", categoria: "Vasos", imagem: "/images/kit6.jpg" },
  { id: 34, nome: "Prato azul cerâmica", preco: 7, cor: "azul", categoria: "Pratos", imagem: "/images/kit7.jpg" },
  { id: 35, nome: "Taça vermelha decorada", preco: 5, cor: "vermelho", categoria: "Taças", imagem: "/images/kit8.jpg" },
  { id: 36, nome: "Vaso prateado moderno", preco: 9, cor: "prateado", categoria: "Vasos", imagem: "/images/kit9.jpg" },
];

export default function Pesquisa() {
  const navigate = useNavigate();
  const location = useLocation();

  const [categoria, setCategoria] = useState("Todas");
  const [preco, setPreco] = useState(20);
  const [busca, setBusca] = useState("");
  const [cor, setCor] = useState("Todas");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const produtosPorPagina = 28;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("query");
    if (query) setBusca(query);
  }, [location.search]);

  const handleCategoria = (cat) => { setCategoria(cat); setPaginaAtual(1); };
  const handleCor = (c) => { setCor(c === cor ? "Todas" : c); setPaginaAtual(1); };
  const handleAlugar = () => navigate("/KitDetalhes");

  const produtosFiltrados = produtos.filter((p) => {
    const condCategoria = categoria === "Todas" || p.categoria === categoria;
    const condBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
    const condPreco = p.preco <= preco;
    const condCor = cor === "Todas" || p.cor === cor;
    return condCategoria && condBusca && condPreco && condCor;
  });

  // Paginação
  const indexUltimoProduto = paginaAtual * produtosPorPagina;
  const indexPrimeiroProduto = indexUltimoProduto - produtosPorPagina;
  const produtosPagina = produtosFiltrados.slice(indexPrimeiroProduto, indexUltimoProduto);
  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);

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
    <main style={{ display: "flex", padding: "30px 60px", minHeight: "100vh", width: "80%", margin: "0 auto" }}>
      {/* FILTROS */}
      <aside style={{ width: "250px", paddingRight: "20px", borderRight: "1px solid #e5bcbc" }}>
        <h3>FAIXA DE PREÇOS</h3>
        <input
          type="range"
          min="0"
          max="20"
          value={preco}
          onChange={(e) => { setPreco(Number(e.target.value)); setPaginaAtual(1); }}
          style={{ width: "100%" }}
        />
        <p>Até R$ {preco},00</p>

        <h3 style={{ marginTop: "20px" }}>CORES</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
          {cores.map((c) => (
            <button
              key={c.nome}
              onClick={() => handleCor(c.nome)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: cor === c.nome ? "3px solid #899662" : "1px solid #ccc",
                cursor: "pointer",
                background:
                  c.nome === "transparente"
                    ? "#f8f8f8 url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\" fill=\"%23ccc\"><rect width=\"5\" height=\"5\"/><rect x=\"5\" y=\"5\" width=\"5\" height=\"5\"/></svg>') repeat"
                    : c.hex,
              }}
              title={c.nome.charAt(0).toUpperCase() + c.nome.slice(1)}
            />
          ))}
        </div>

        <h3>CATEGORIAS</h3>
        {["Todas", "Vasos", "Pratos", "Taças"].map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoria(cat)}
            style={{
              display: "block",
              marginBottom: "8px",
              backgroundColor: categoria === cat ? "#899662" : "#fff",
              color: categoria === cat ? "#fff" : "#2B3A21",
              border: "1px solid #899662",
              borderRadius: "4px",
              padding: "6px 12px",
              width: "100%",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}

        <button
          onClick={() => {
            setPreco(20);
            setCategoria("Todas");
            setBusca("");
            setCor("Todas");
            setPaginaAtual(1);
          }}
          style={{
            marginTop: "20px",
            backgroundColor: "#fff",
            border: "1px solid #899662",
            color: "#2B3A21",
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: "600",
            borderRadius: "4px",
          }}
        >
          LIMPAR FILTROS
        </button>
      </aside>

      {/* RESULTADOS */}
      <section style={{ flex: 1, paddingLeft: "40px" }}>
        <p>
          {busca
            ? `Resultados para “${busca}” (${produtosFiltrados.length} produtos)`
            : `${produtosFiltrados.length} produtos encontrados`}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "24px",
          }}
        >
          {produtosPagina.map((p) => (
            <div
              key={p.id}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #eee",
                borderRadius: "12px",
                textAlign: "center",
                padding: "16px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
              }}
            >
              <img
                src={p.imagem}
                alt={p.nome}
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "12px",
                }}
              />
              <p style={{ fontWeight: "600" }}>{p.nome}</p>
              <p style={{ margin: "6px 0" }}>R$ {p.preco},00</p>
              <button
                onClick={handleAlugar}
                style={{
                  backgroundColor: "#899662",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Alugar
              </button>
            </div>
          ))}
        </div>

        {/* PAGINAÇÃO */}
        {produtosFiltrados.length > produtosPorPagina && (
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
            <button
              onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "1px solid #899662",
                backgroundColor: "#fff",
                cursor: paginaAtual === 1 ? "not-allowed" : "pointer",
              }}
            >
              Anterior
            </button>
            <button
              onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas}
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "1px solid #899662",
                backgroundColor: "#fff",
                cursor: paginaAtual === totalPaginas ? "not-allowed" : "pointer",
              }}
            >
              Próximo
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
