import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ProdutoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [produto, setProduto] = useState(null);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [loading, setLoading] = useState(true);

  // URL da API
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. BUSCAR DETALHES DO PRODUTO
  useEffect(() => {
    const fetchProduto = async () => {
      try {
        if (!id) return;
        
        // Endpoint de Produto Individual
        const response = await fetch(`${apiUrl}/produto/produtos/${id}/`);
        
        if (!response.ok) throw new Error("Erro ao buscar produto");
        
        const data = await response.json();
        
        // Organiza imagens para o carrossel
        let imgs = [];
        if (data.imagens_carrossel && data.imagens_carrossel.length > 0) {
            imgs = data.imagens_carrossel.map(item => item.imagem);
        } else if (data.imagem) {
            imgs = [data.imagem];
        }

        setProduto({ ...data, imagensLista: imgs });

      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [id, apiUrl]);

  // 2. ADICIONAR AO CARRINHO (PRODUTO INDIVIDUAL)
  const handleRentClick = async () => {
    try {
      // Endpoint para adicionar produto simples (NÃO é o adicionar-kit)
      const response = await fetch(`${apiUrl}/pedido/carrinho/${id}/adicionar/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade: 1 }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/Carrinho");
      } else {
        alert(data.error || "Estoque insuficiente.");
      }
    } catch (error) {
      console.error("Erro ao alugar:", error);
      alert("Erro de conexão.");
    }
  };

  const mudarImagem = (direcao) => {
    if (!produto || !produto.imagensLista) return;
    const total = produto.imagensLista.length;
    if (total <= 1) return;

    if (direcao === "left") {
      setImagemAtual((prev) => (prev === 0 ? total - 1 : prev - 1));
    } else {
      setImagemAtual((prev) => (prev === total - 1 ? 0 : prev + 1));
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Carregando...</div>;
  if (!produto) return <div style={{ textAlign: "center", padding: "50px" }}>Produto não encontrado.</div>;

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 24px", fontFamily: "'Arial', sans-serif", color: "#333" }}>
      
      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "40px", alignItems: "start" }}>
        
        {/* --- CARROSSEL DE IMAGENS --- */}
        <div style={{ width: "100%", textAlign: "center" }}>
          <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "1px solid #eee", minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            
            {produto.imagensLista.length > 0 ? (
                <img 
                    src={produto.imagensLista[imagemAtual]} 
                    alt={produto.nome} 
                    style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }} 
                />
            ) : (
                <p>Sem imagem</p>
            )}

            {produto.imagensLista.length > 1 && (
                <>
                    <button onClick={() => mudarImagem("left")} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "#6B774D", color: "#fff", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "20px" }}>‹</button>
                    <button onClick={() => mudarImagem("right")} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "#6B774D", color: "#fff", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "20px" }}>›</button>
                </>
            )}
          </div>
        </div>

        {/* --- INFORMAÇÕES --- */}
        <div>
          <h1 style={{ fontSize: "28px", color: "#2B3A21", marginBottom: "10px" }}>{produto.nome}</h1>
          
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <span style={{ background: "#eee", padding: "5px 10px", borderRadius: "4px", fontSize: "12px" }}>Cód: {produto.codigo}</span>
            <span style={{ background: "#eee", padding: "5px 10px", borderRadius: "4px", fontSize: "12px" }}>Cor: {produto.cor}</span>
            <span style={{ background: produto.disponivel ? "#d4edda" : "#f8d7da", color: produto.disponivel ? "#155724" : "#721c24", padding: "5px 10px", borderRadius: "4px", fontSize: "12px" }}>
                {produto.disponivel ? "Disponível" : "Indisponível"}
            </span>
          </div>

          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#2B3A21", marginBottom: "20px" }}>
            {produto.preco_formatado || `R$ ${produto.preco}`}
            <span style={{ fontSize: "14px", color: "#666", fontWeight: "normal" }}> /unidade</span>
          </p>

          <button 
            onClick={handleRentClick}
            disabled={!produto.disponivel}
            style={{ 
                background: produto.disponivel ? "#899662" : "#ccc", 
                color: "#fff", padding: "15px 40px", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: produto.disponivel ? "pointer" : "not-allowed", width: isMobile ? "100%" : "auto" 
            }}
          >
            {produto.disponivel ? "ADICIONAR AO CARRINHO" : "INDISPONÍVEL"}
          </button>

          <div style={{ marginTop: "30px" }}>
            <h3 style={{ fontSize: "18px", color: "#2B3A21", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>Descrição</h3>
            <p style={{ marginTop: "10px", lineHeight: "1.6", color: "#555" }}>
                {produto.descricao || "Sem descrição detalhada."}
            </p>
          </div>
        </div>

      </section>
    </main>
  );
}