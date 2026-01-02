import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Pesquisa() {
  const navigate = useNavigate();
  const location = useLocation();

  const apiUrl = import.meta.env.VITE_API_URL;

  // --- ESTADOS DOS FILTROS ---
  const [categoria, setCategoria] = useState("Todas");
  const [preco, setPreco] = useState(500); // Valor inicial máximo
  const [busca, setBusca] = useState("");
  const [cor, setCor] = useState("Todas");

  // --- ESTADOS DA LISTA E PAGINAÇÃO ---
  const [produtos, setProdutos] = useState([]); // Produtos retornados da API
  const [loading, setLoading] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0); // Total de itens no banco (count)

  const produtosPorPagina = 28; // Tem que bater com o page_size do Django (StandardResultsSetPagination)

  // 1. Ler query da URL inicial (ex: vindo da Home clicando em "Ver mais")
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryBusca = params.get("query");
    const queryCat = params.get("categoria");

    if (queryBusca) setBusca(queryBusca);
    if (queryCat) setCategoria(queryCat);
  }, [location.search]);

  // 2. BUSCAR NA API (Server-Side Filtering)
  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      try {
        // Monta os parâmetros para enviar ao Django
        const params = new URLSearchParams();

        // Paginação
        params.append("page", paginaAtual.toString());

        // Filtros (Só envia se não for vazio ou "Todas")
        if (busca) params.append("q", busca);
        if (cor !== "Todas") params.append("cor", cor);
        if (categoria !== "Todas") params.append("categoria", categoria);

        // Envia o preço máximo apenas se for menor que o teto (opcional, ou envia sempre)
        if (preco > 0) params.append("preco_max", preco.toString());

        // Faz a chamada ao endpoint de busca avançada
        const response = await fetch(`${apiUrl}/produto/produtos/busca_produto/?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Erro na requisição");
        }

        const data = await response.json();

        // O Django com paginação retorna: { count: 100, results: [...] }
        if (data.results) {
          setProdutos(data.results);
          setTotalResultados(data.count);
        } else {
          // Caso a paginação esteja desligada (fallback)
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

    // Debounce: Espera 500ms após o usuário parar de digitar/clicar para chamar a API
    const delayDebounce = setTimeout(() => {
      fetchProdutos();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [busca, cor, categoria, preco, paginaAtual, apiUrl]);

  // --- HANDLERS ---

  const handleCategoria = (cat) => {
    setCategoria(cat);
    setPaginaAtual(1); // Volta para página 1 ao mudar filtro
  };

  const handleCor = (c) => {
    setCor(c === cor ? "Todas" : c);
    setPaginaAtual(1);
  };

  const handlePrecoChange = (e) => {
    setPreco(Number(e.target.value));
    setPaginaAtual(1);
  }

  // --- FUNÇÃO DE NAVEGAÇÃO CORRIGIDA ---
  // Agora recebe o OBJETO inteiro (item), não apenas o ID
  const handleAlugar = (item) => {
    // Verifica se a Categoria tem "kit" no nome OU se o Nome do produto tem "kit"
    const nomeCategoria = item.categoria?.nome?.toLowerCase() || "";
    const nomeProduto = item.nome?.toLowerCase() || "";

    const isKit = nomeCategoria.includes("kit") || nomeProduto.includes("kit");

    if (isKit) {
      navigate(`/KitDetalhes/${item.id}`); // Vai para a página de Kit
    } else {
      navigate(`/produto/${item.id}`); // Vai para a página de Produto
    }
  };

  // Limpar tudo
  const limparFiltros = () => {
    setPreco(500);
    setCategoria("Todas");
    setBusca("");
    setCor("Todas");
    setPaginaAtual(1);
    navigate("/pesquisa"); // Limpa URL visualmente
  };

  // Cálculo de total de páginas
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

      {/* --- SIDEBAR DE FILTROS --- */}
      <aside style={{ width: "250px", minWidth: "250px", borderRight: "1px solid #e5bcbc", paddingRight: "20px" }}>

        {/* Busca por Texto */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "8px", fontSize: "16px", fontWeight: "bold", color: "#2B3A21" }}>BUSCAR</h3>
          <input
            type="text"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
            placeholder="Nome, código..."
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Slider de Preço */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "8px", fontSize: "16px", fontWeight: "bold", color: "#2B3A21" }}>PREÇO MÁXIMO</h3>
          <input
            type="range"
            min="0"
            max="500"
            value={preco}
            onChange={handlePrecoChange}
            style={{ width: "100%", accentColor: "#899662" }}
          />
          <p style={{ marginTop: "5px", color: "#555" }}>Até R$ {preco},00</p>
        </div>

        {/* Filtro de Cores */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "8px", fontSize: "16px", fontWeight: "bold", color: "#2B3A21" }}>CORES</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
                  boxShadow: cor === c.nome ? "0 0 5px rgba(0,0,0,0.3)" : "none"
                }}
                title={c.nome.charAt(0).toUpperCase() + c.nome.slice(1)}
              />
            ))}
          </div>
        </div>

        {/* Filtro de Categorias */}
        <div>
          <h3 style={{ marginBottom: "8px", fontSize: "16px", fontWeight: "bold", color: "#2B3A21" }}>CATEGORIAS</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {["Todas", "Vasos", "Pratos", "Taças", "Kits", "Móveis"].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoria(cat)}
                style={{
                  textAlign: "left",
                  backgroundColor: categoria === cat ? "#899662" : "transparent",
                  color: categoria === cat ? "#fff" : "#2B3A21",
                  border: "1px solid #899662",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={limparFiltros}
          style={{
            marginTop: "30px",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            color: "#555",
            padding: "10px",
            width: "100%",
            cursor: "pointer",
            fontWeight: "600",
            borderRadius: "6px",
          }}
        >
          LIMPAR FILTROS
        </button>
      </aside>

      {/* --- ÁREA DE RESULTADOS --- */}
      <section style={{ flex: 1 }}>
        <h2 style={{ fontSize: "20px", marginBottom: "20px", color: "#2B3A21" }}>
          {loading
            ? "Buscando..."
            : `${totalResultados} produto(s) encontrado(s)`
          }
        </h2>

        {!loading && produtos.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
            <p style={{ fontSize: "18px", color: "#777" }}>Nenhum produto encontrado com os filtros selecionados.</p>
            <button onClick={limparFiltros} style={{ marginTop: "10px", color: "#899662", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>Limpar filtros</button>
          </div>
        )}

        {/* Grid de Produtos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "24px",
          }}
        >
          {produtos.map((p) => (
            <div
              key={p.id}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #eee",
                borderRadius: "12px",
                textAlign: "center",
                padding: "16px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              // AQUI MUDOU: Passamos o objeto 'p' inteiro
              onClick={() => handleAlugar(p)}
            >
              <div>
                <img
                  src={p.imagem || "/placeholder.jpg"}
                  alt={p.nome}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "12px",
                  }}
                />
                <p style={{ fontWeight: "600", fontSize: "16px", color: "#333", marginBottom: "4px" }}>
                  {p.nome}
                </p>
                <p style={{ fontSize: "12px", color: "#777", marginBottom: "8px" }}>
                  {p.codigo}
                </p>
              </div>

              <div>
                <p style={{ margin: "10px 0", fontSize: "18px", fontWeight: "bold", color: "#2B3A21" }}>
                  {p.preco_formatado || `R$ ${p.preco}`}
                </p>
                <button
                  // AQUI MUDOU: Passamos o objeto 'p' inteiro
                  onClick={(e) => {
                    e.stopPropagation(); // Evita abrir o detalhe duas vezes
                    handleAlugar(p);
                  }}
                  style={{
                    backgroundColor: "#899662",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "600"
                  }}
                >
                  ALUGAR
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINAÇÃO */}
        {totalPaginas > 1 && (
          <div style={{ marginTop: "40px", display: "flex", justifyContent: "center", gap: "10px", alignItems: "center" }}>
            <button
              onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "1px solid #899662",
                backgroundColor: paginaAtual === 1 ? "#eee" : "#fff",
                color: paginaAtual === 1 ? "#aaa" : "#899662",
                cursor: paginaAtual === 1 ? "not-allowed" : "pointer",
              }}
            >
              &laquo; Anterior
            </button>

            <span style={{ fontWeight: "bold", color: "#555" }}>
              Página {paginaAtual} de {totalPaginas}
            </span>

            <button
              onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas}
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "1px solid #899662",
                backgroundColor: paginaAtual === totalPaginas ? "#eee" : "#fff",
                color: paginaAtual === totalPaginas ? "#aaa" : "#899662",
                cursor: paginaAtual === totalPaginas ? "not-allowed" : "pointer",
              }}
            >
              Próximo &raquo;
            </button>
          </div>
        )}
      </section>
    </main>
  );
}