import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function KitDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [kitData, setKitData] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
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

  useEffect(() => {
    const fetchKitDetalhes = async () => {
      try {
        if (!id) return;
        const response = await fetch(`${apiUrl}/produto/kits/${id}/`);
        if (!response.ok) throw new Error("Erro ao buscar detalhes");
        const data = await response.json();
        setKitData(data);

        if (data.produtos && data.produtos.length > 0) {
          const produtosFormatados = data.produtos.map((p) => {
            let imgs = [];
            if (p.imagens_carrossel && p.imagens_carrossel.length > 0) {
              imgs = p.imagens_carrossel.map((item) => item.imagem);
            } else if (p.imagem) {
              imgs = [p.imagem];
            }
            return { ...p, imagensCarrossel: imgs };
          });
          setProdutos(produtosFormatados);
          setProdutoSelecionado(produtosFormatados[0]);
        }
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchKitDetalhes();
  }, [id, apiUrl]);

  // --- FUNÇÃO DE ALUGAR (AGORA VIA LOCALSTORAGE) ---
  const handleRentClick = () => {
    if (!dataRetirada || !dataDevolucao) {
      alert("Por favor, selecione as datas de Retirada e Devolução.");
      return;
    }

    // Criamos o objeto do kit para o carrinho
    const novoItem = {
      id: `kit_${id}`, // ID único para controle no front
      tipo: "kit",
      original_id: id,
      quantidade: 1,
      data_retirada: dataRetirada,
      data_devolucao: dataDevolucao,
      tipo_entrega: tipoEntrega,
    };

    // 1. Pegar o carrinho atual do navegador ou criar um vazio
    const carrinhoAtual = JSON.parse(localStorage.getItem("carrinho") || "[]");

    // 2. Verificar se este kit já está no carrinho para não duplicar
    const index = carrinhoAtual.findIndex((item) => item.id === novoItem.id);

    if (index > -1) {
      // Se já existe, apenas atualizamos os dados/quantidade
      carrinhoAtual[index] = { ...carrinhoAtual[index], ...novoItem };
    } else {
      // Se é novo, adicionamos à lista
      carrinhoAtual.push(novoItem);
    }

    // 3. Salvar de volta no LocalStorage
    localStorage.setItem("carrinho", JSON.stringify(carrinhoAtual));

    // 4. Navegar para a página do Carrinho
    navigate("/Carrinho");
  };

  const mudarImagem = (direcao) => {
    if (!produtoSelecionado || !produtoSelecionado.imagensCarrossel) return;
    const total = produtoSelecionado.imagensCarrossel.length;
    if (total <= 1) return;
    if (direcao === "left") setImagemAtual((prev) => (prev === 0 ? total - 1 : prev - 1));
    else setImagemAtual((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const handleItemClick = (index) => {
    setProdutoSelecionado(produtos[index]);
    setImagemAtual(0);
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Carregando...</div>;
  if (!kitData) return <div style={{ textAlign: "center", padding: "50px" }}>Kit não encontrado.</div>;

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "5px 24px", fontFamily: "'Arial', sans-serif", color: "#333" }}>
      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "30px" : "60px", alignItems: "start", marginTop: "20px" }}>
        {/* CARROSSEL */}
        <div style={{ width: "100%", maxWidth: "520px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ position: "relative", width: "100%", borderRadius: "10px", overflow: "hidden", backgroundColor: "#fff", border: "1px solid #eee", display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 0", minHeight: "300px" }}>
            {produtoSelecionado?.imagensCarrossel?.length > 0 ? (
              <img src={produtoSelecionado.imagensCarrossel[imagemAtual]} alt={produtoSelecionado.nome} style={{ width: isMobile ? "90%" : "70%", maxHeight: "400px", objectFit: "contain" }} />
            ) : (
              <p>Sem Imagem</p>
            )}
            {produtoSelecionado?.imagensCarrossel?.length > 1 && (
              <>
                <button onClick={() => mudarImagem("left")} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "#6B774D", color: "#fff", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "20px" }}>‹</button>
                <button onClick={() => mudarImagem("right")} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "#6B774D", color: "#fff", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "20px" }}>›</button>
              </>
            )}
          </div>
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>Visualizando: <strong>{produtoSelecionado?.nome}</strong></p>
        </div>

        {/* INFO */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#2B3A21", margin: 0 }}>{kitData.nome}</h1>

          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ background: "#899662", color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>Código: {kitData.codigo}</span>
          </div>

          {/* --- SELETOR DE ENTREGA --- */}
          <div>
            <p style={{ marginBottom: "8px", fontWeight: "600", color: "#555" }}>Opção de Entrega:</p>
            <div style={{ display: "flex", gap: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                <input type="radio" name="tipoEntrega" value="RETIRADA" checked={tipoEntrega === "RETIRADA"} onChange={() => setTipoEntrega("RETIRADA")} style={{ accentColor: "#899662" }} />
                Retirar na Loja
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                <input type="radio" name="tipoEntrega" value="ENTREGA" checked={tipoEntrega === "ENTREGA"} onChange={() => setTipoEntrega("ENTREGA")} style={{ accentColor: "#899662" }} />
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
              <input type="date" value={dataDevolucao} onChange={(e) => setDataDevolucao(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", width: "100%", fontFamily: "inherit" }} />
            </div>
          </div>

          <p style={{ fontSize: "32px", fontWeight: "700", color: "#2B3A21", marginTop: "10px" }}>{kitData.preco_formatado || `R$ ${kitData.preco}`}</p>

          <button
            onClick={handleRentClick}
            style={{
              backgroundColor: "#899662",
              color: "#fff",
              padding: "16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "16px",
              marginTop: "5px",
              width: isMobile ? "100%" : "300px",
              boxShadow: "0 4px 10px rgba(137, 150, 98, 0.3)",
            }}
          >
            ALUGAR KIT COMPLETO
          </button>

          <div style={{ marginTop: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#2B3A21" }}>Descrição do Kit</h3>
            <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.6" }}>{kitData.descricao}</p>
          </div>
        </div>
      </section>

      {/* Grid de Itens */}
      <section style={{ marginTop: "60px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "20px", color: "#2B3A21" }}>Itens Inclusos</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "20px" }}>
          {produtos.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(index)}
              style={{
                border: produtoSelecionado?.id === item.id ? "2px solid #899662" : "1px solid #eee",
                borderRadius: "12px",
                padding: "10px",
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img src={item.imagem} alt={item.nome} style={{ width: "100%", height: "100px", objectFit: "contain" }} />
              <p style={{ fontSize: "13px", fontWeight: "600", marginTop: "5px" }}>{item.nome}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}