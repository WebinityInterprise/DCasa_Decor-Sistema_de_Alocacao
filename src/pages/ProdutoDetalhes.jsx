import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ProdutoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [produto, setProduto] = useState(null);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DO FORMULÁRIO ---
  const [dataRetirada, setDataRetirada] = useState("");
  const [dataDevolucao, setDataDevolucao] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("RETIRADA");

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. BUSCAR DETALHES DO PRODUTO E ORGANIZAR IMAGENS
  useEffect(() => {
    const fetchProduto = async () => {
      try {
        if (!id) return;

        const response = await fetch(`${apiUrl}/produto/produtos/${id}/`);

        if (!response.ok) throw new Error("Erro ao buscar produto");

        const data = await response.json();

        // --- LÓGICA DO CARROSSEL ---
        // Cria uma lista única com a imagem principal (capa) + imagens da galeria
        let listaImagens = [];

        // 1. Adiciona a imagem principal primeiro
        if (data.imagem) {
            listaImagens.push(data.imagem);
        }

        // 2. Adiciona as imagens extras do carrossel (se houver)
        if (data.imagens_carrossel && Array.isArray(data.imagens_carrossel)) {
            const extras = data.imagens_carrossel.map((item) => item.imagem);
            listaImagens = [...listaImagens, ...extras];
        }

        // Se não tiver nenhuma imagem, coloca um placeholder
        if (listaImagens.length === 0) {
            listaImagens.push("/images/placeholder.jpg"); 
        }

        // Salva no estado com a nova propriedade 'imagensLista'
        setProduto({ ...data, imagensLista: listaImagens });

      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [id, apiUrl]);

  // 2. ADICIONAR AO CARRINHO (VIA LOCALSTORAGE)
  const handleRentClick = () => {
    // Validação básica
    if (!dataRetirada || !dataDevolucao) {
      alert("Por favor, selecione as datas de Retirada e Devolução.");
      return;
    }

    if (!produto.disponivel) {
      alert("Este produto está indisponível no momento.");
      return;
    }

    // Cria o objeto do item para o carrinho
    const novoItem = {
      id: `prod_${id}`, // Prefixo 'prod_' para diferenciar de kits e eventos
      tipo: "produto",
      original_id: id,
      quantidade: 1, // Começa com 1 unidade
      data_retirada: dataRetirada,
      data_devolucao: dataDevolucao,
      tipo_entrega: tipoEntrega,
      
      // Dados visuais para exibir no carrinho imediatamente
      nome: produto.nome,
      codigo: produto.codigo,
      preco: produto.preco,
      imagem: produto.imagensLista[0] // Pega a primeira imagem da lista
    };

    // 1. Pegar carrinho atual do navegador ou criar um vazio
    const carrinhoAtual = JSON.parse(localStorage.getItem("carrinho") || "[]");

    // 2. Verificar duplicidade (se já tem esse produto com esse ID)
    const index = carrinhoAtual.findIndex((item) => item.id === novoItem.id);

    if (index > -1) {
      // Se já existe, atualiza as datas/entrega (mantém a quantidade que já estava ou reseta, aqui optei por atualizar dados)
      carrinhoAtual[index] = { ...carrinhoAtual[index], ...novoItem };
    } else {
      // Se é novo, adiciona à lista
      carrinhoAtual.push(novoItem);
    }

    // 3. Salvar de volta no LocalStorage e Navegar
    localStorage.setItem("carrinho", JSON.stringify(carrinhoAtual));
    navigate("/Carrinho");
  };

  // Lógica para passar as fotos
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
      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "60px", alignItems: "start", marginTop: "20px" }}>
        
        {/* --- COLUNA ESQUERDA: CARROSSEL DE IMAGENS --- */}
        <div style={{ width: "100%", maxWidth: "520px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ position: "relative", width: "100%", borderRadius: "10px", overflow: "hidden", backgroundColor: "#fff", border: "1px solid #eee", display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 0", minHeight: "300px" }}>
            
            {/* Imagem Atual */}
            {produto.imagensLista.length > 0 ? (
              <img
                src={produto.imagensLista[imagemAtual]}
                alt={produto.nome}
                style={{ width: isMobile ? "90%" : "70%", maxHeight: "400px", objectFit: "contain" }}
              />
            ) : (
              <p>Sem imagem</p>
            )}

            {/* Setas de Navegação (Só mostra se tiver mais de 1 foto) */}
            {produto.imagensLista.length > 1 && (
              <>
                <button onClick={() => mudarImagem("left")} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "#6B774D", color: "#fff", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "20px" }}>‹</button>
                <button onClick={() => mudarImagem("right")} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "#6B774D", color: "#fff", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "20px" }}>›</button>
              </>
            )}
          </div>
          
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
             Foto {imagemAtual + 1} de {produto.imagensLista.length}
          </p>
        </div>

        {/* --- COLUNA DIREITA: INFORMAÇÕES E FORMULÁRIO --- */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#2B3A21", margin: 0 }}>{produto.nome}</h1>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ background: "#899662", color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>Código: {produto.codigo}</span>
            <span style={{ background: "#eee", color: "#555", padding: "4px 12px", borderRadius: "12px", fontSize: "12px" }}>Cor: {produto.cor}</span>
            <span style={{ background: produto.disponivel ? "#d4edda" : "#f8d7da", color: produto.disponivel ? "#155724" : "#721c24", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
              {produto.disponivel ? "Disponível" : "Indisponível"}
            </span>
          </div>

          {/* --- SELETOR DE ENTREGA --- */}
          <div>
            <p style={{ marginBottom: "8px", fontWeight: "600", color: "#555" }}>Opção de Entrega:</p>
            <div style={{ display: "flex", gap: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                <input type="radio" name="tipoEntregaProd" value="RETIRADA" checked={tipoEntrega === "RETIRADA"} onChange={() => setTipoEntrega("RETIRADA")} style={{ accentColor: "#899662" }} />
                Retirar na Loja
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                <input type="radio" name="tipoEntregaProd" value="ENTREGA" checked={tipoEntrega === "ENTREGA"} onChange={() => setTipoEntrega("ENTREGA")} style={{ accentColor: "#899662" }} />
                Receber (Entrega)
              </label>
            </div>
          </div>

          {/* --- DATAS --- */}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <p style={{ marginBottom: "6px", fontWeight: "600", color: "#555" }}>Data de Retirada</p>
              <input type="date" value={dataRetirada} onChange={(e) => setDataRetirada(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", width: "100%", fontFamily: "inherit" }} />
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <p style={{ marginBottom: "6px", fontWeight: "600", color: "#555" }}>Data de Devolução</p>
              <input type="date" value={dataDevolucao} onChange={(e) => setDataDevolucao(e.target.value)} min={dataRetirada} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", width: "100%", fontFamily: "inherit" }} />
            </div>
          </div>

          <p style={{ fontSize: "32px", fontWeight: "700", color: "#2B3A21", marginTop: "10px" }}>
            {produto.preco_formatado || `R$ ${produto.preco}`}
            <span style={{ fontSize: "14px", color: "#666", fontWeight: "normal" }}> /unidade</span>
          </p>

          <button
            onClick={handleRentClick}
            disabled={!produto.disponivel}
            style={{
              backgroundColor: produto.disponivel ? "#899662" : "#ccc",
              color: "#fff",
              padding: "16px",
              borderRadius: "8px",
              border: "none",
              cursor: produto.disponivel ? "pointer" : "not-allowed",
              fontWeight: "700",
              fontSize: "16px",
              marginTop: "5px",
              width: isMobile ? "100%" : "300px",
              boxShadow: produto.disponivel ? "0 4px 10px rgba(137, 150, 98, 0.3)" : "none",
            }}
          >
            {produto.disponivel ? "ADICIONAR AO CARRINHO" : "INDISPONÍVEL"}
          </button>

          <div style={{ marginTop: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#2B3A21", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>Descrição</h3>
            <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.6", marginTop: "10px" }}>
              {produto.descricao || "Sem descrição detalhada."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}