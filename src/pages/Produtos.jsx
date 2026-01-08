import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Produtos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  // URL base do arquivo .env
  const apiUrl = import.meta.env.VITE_API_URL;

  // --- BUSCAR PRODUTOS DO BACKEND ---
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        // A API de produtos aceita paginação, mas aqui pegamos a primeira página padrão
        const response = await fetch(`${apiUrl}/produto/produtos/`);
        
        if (!response.ok) {
          throw new Error("Erro ao buscar produtos");
        }

        const data = await response.json();

        // Verifica se é paginado (tem 'results') ou lista direta
        if (data.results) {
            setProdutos(data.results);
        } else {
            setProdutos(data);
        }

      } catch (error) {
        console.error("Erro na API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, [apiUrl]);

  const handleImagemClick = (produtoId) => {
    // Redireciona para a página de detalhes do produto
    navigate(`/ProdutoDetalhes/${produtoId}`); 
  };

  // --- FUNÇÃO DE ALUGAR (VIA LOCALSTORAGE) ---
  const handleAlugarClick = (e, produto) => {
    e.stopPropagation(); // Evita ativar o click do card (que leva aos detalhes)

    // Objeto do item para o carrinho
    const novoItem = {
      id: `produto_${produto.id}`, // Prefixo para diferenciar de kits
      tipo: "produto",
      original_id: produto.id,
      quantidade: 1,
      // Passamos vazio pois não tem seletor de data na listagem
      data_retirada: "", 
      data_devolucao: "",
      tipo_entrega: "RETIRADA", // Padrão
      
      // Dados visuais
      nome: produto.nome,
      preco: produto.preco, // String ou number vindo da API
      preco_formatado: produto.preco_formatado, // R$ XX,XX
      imagem: produto.imagem 
    };

    // 1. Pegar o carrinho atual
    const carrinhoAtual = JSON.parse(localStorage.getItem("carrinho") || "[]");

    // 2. Verificar se já existe este produto específico
    const index = carrinhoAtual.findIndex((item) => item.id === novoItem.id);

    if (index > -1) {
      // Se já existe, atualiza os dados (mas mantém a quantidade ou a reseta, aqui optei por sobrescrever)
      carrinhoAtual[index] = { ...carrinhoAtual[index], ...novoItem };
    } else {
      // Adiciona novo
      carrinhoAtual.push(novoItem);
    }

    // 3. Salvar
    localStorage.setItem("carrinho", JSON.stringify(carrinhoAtual));

    // 4. Navegar para o carrinho
    navigate("/Carrinho");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#2B3A21" }}>
        <h2>Carregando produtos...</h2>
      </div>
    );
  }

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 24px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "700",
          marginBottom: "40px",
          color: "#2B3A21",
        }}
      >
        NOSSOS PRODUTOS
      </h1>

      {/* Grid de Produtos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
          gap: "30px",
          justifyContent: "center",
        }}
      >
        {produtos.map((produto) => (
          <div
            key={produto.id}
            onClick={() => handleImagemClick(produto.id)}
            style={{
              border: "1px solid #eee",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "#fff",
              boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
              cursor: "pointer",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              display: "flex",
              flexDirection: "column",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.05)";
            }}
          >
            {/* Imagem do Produto */}
            <div style={{ height: "200px", overflow: "hidden" }}>
                <img
                  src={produto.imagem || "/placeholder.png"} // Fallback se não tiver imagem
                  alt={produto.nome}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
            </div>

            {/* Informações */}
            <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
              <h3
                style={{
                  fontSize: "18px",
                  color: "#2B3A21",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                {produto.nome}
              </h3>
              
              {/* Descrição curta (opcional) */}
              {produto.descricao && (
                  <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px", flex: 1 }}>
                    {produto.descricao.length > 60 
                        ? produto.descricao.substring(0, 60) + "..." 
                        : produto.descricao}
                  </p>
              )}

              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#899662",
                  marginBottom: "20px",
                  marginTop: "auto" // Empurra o preço para baixo se a descrição for curta
                }}
              >
                {produto.preco_formatado || `R$ ${produto.preco}`}
              </p>

              <button
                onClick={(e) => handleAlugarClick(e, produto)}
                style={{
                  width: "100%",
                  backgroundColor: "#2B3A21",
                  color: "#fff",
                  padding: "12px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "background 0.3s"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#899662"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#2B3A21"}
              >
                ALUGAR
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}