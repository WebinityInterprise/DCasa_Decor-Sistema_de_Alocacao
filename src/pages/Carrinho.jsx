import React, { useState, useEffect } from "react";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi"; // Adicionado ícones
import { useNavigate } from "react-router-dom";

export default function Carrinho() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    data_evento: "",
    hora_evento: "",
    data_retirada: "",
    data_devolucao: "",
    tipo_entrega: "RETIRADA",
    endereco: "",
    bairro: "",
    cidade: "",
    numero: "",
    cep: "",
    complemento: "",
    estado: "SP"
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchCarrinho = async () => {
    const itensLocal = JSON.parse(localStorage.getItem("carrinho") || "[]");
    if (itensLocal.length === 0) {
      setItens([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/pedido/carrinho/detalhes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itens: itensLocal }),
      });
      const data = await response.json();
      setItens(data.produtos || []);
      setTotal(data.total || 0);

      if (data.produtos.length > 0) {
        setFormData(prev => ({
          ...prev,
          data_retirada: data.produtos[0].data_retirada || "",
          data_devolucao: data.produtos[0].data_devolucao || "",
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarrinho();
  }, []);

  // --- NOVA FUNÇÃO: ALTERAR QUANTIDADE ---
  const alterarQuantidade = (id, novaQtd) => {
    if (novaQtd < 1) return; // Não permite menos de 1
    const itensLocal = JSON.parse(localStorage.getItem("carrinho") || "[]");
    const index = itensLocal.findIndex((item) => item.id === id);
    
    if (index > -1) {
      itensLocal[index].quantidade = novaQtd;
      localStorage.setItem("carrinho", JSON.stringify(itensLocal));
      fetchCarrinho(); // Recarrega para atualizar subtotal e total via API
    }
  };

  const removerItem = (id) => {
    const itensLocal = JSON.parse(localStorage.getItem("carrinho") || "[]");
    const filtrados = itensLocal.filter((item) => item.id !== id);
    localStorage.setItem("carrinho", JSON.stringify(filtrados));
    fetchCarrinho();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.telefone || !formData.data_retirada) {
      alert("Por favor, preencha Nome, Telefone e Datas de Aluguel.");
      return;
    }
    const itensLocal = JSON.parse(localStorage.getItem("carrinho") || "[]");
    try {
      const response = await fetch(`${apiUrl}/pedido/carrinho/finalizar/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, itens: itensLocal }),
      });
      const pedidoCriado = await response.json();
      if (response.ok) {
        localStorage.removeItem("carrinho");
        const waRes = await fetch(`${apiUrl}/pedido/carrinho/${pedidoCriado.id}/whatsapp/`);
        const waData = await waRes.json();
        alert("Orçamento solicitado! Redirecionando para o WhatsApp...");
        window.location.href = waData.whatsapp_url;
      } else {
        alert("Erro ao finalizar pedido.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Carregando...</div>;

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 24px 80px", fontFamily: "'Inter', sans-serif", color: "#2B3A21" }}>
      <h1 style={{ textAlign: "center", fontSize: "26px", fontWeight: "700", marginBottom: "20px" }}>MEU CARRINHO</h1>
      <hr style={{ border: "1px solid #899662", marginBottom: "30px" }} />

      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "40px", alignItems: "flex-start", gridTemplateAreas: isMobile ? `"form" "itens"` : `"itens form"` }}>
        
        {/* FORMULÁRIO */}
        <div style={{ gridArea: "form", border: "1px solid #ccc", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", fontSize: "14px", background: "#fff" }}>
          <div>
            <h3 style={{ fontWeight: "600", marginBottom: "8px" }}>INFORMAÇÕES PESSOAIS:</h3>
            <label>Nome Completo:</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} style={inputStyle} />
            <label>E-mail:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
            <label>Telefone:</label>
            <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} style={inputStyle} />
          </div>
          <hr style={{ border: "1px solid #899662", margin: "15px 0" }} />
          <div>
            <h3 style={{ fontWeight: "700", marginBottom: "8px" }}>PERÍODO DE ALUGUEL:</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{flex: 1}}><label>Data Retirada:</label><input type="date" name="data_retirada" value={formData.data_retirada} onChange={handleChange} style={inputStyle} /></div>
              <div style={{flex: 1}}><label>Data Devolução:</label><input type="date" name="data_devolucao" value={formData.data_devolucao} onChange={handleChange} style={inputStyle} /></div>
            </div>
          </div>
          <hr style={{ border: "1px solid #899662", margin: "15px 0" }} />
          <div>
            <h3 style={{ fontWeight: "700", marginBottom: "8px" }}>INFORMAÇÕES DO EVENTO:</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "150px" }}><label>Data do Evento:</label><input type="date" name="data_evento" value={formData.data_evento} onChange={handleChange} style={inputStyle} /></div>
              <div style={{ flex: 1, minWidth: "150px" }}><label>Hora do Evento:</label><input type="time" name="hora_evento" value={formData.hora_evento} onChange={handleChange} style={inputStyle} /></div>
            </div>
          </div>
          <hr style={{ border: "1px solid #899662", margin: "15px 0" }} />
          <div>
            <h3 style={{ fontWeight: "700", marginBottom: "8px" }}>INFORMAÇÕES DE ENTREGA:</h3>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <label><input type="radio" name="tipo_entrega" value="RETIRADA" checked={formData.tipo_entrega === "RETIRADA"} onChange={() => setFormData({...formData, tipo_entrega: "RETIRADA"})} /> Retirar na Loja</label>
              <label><input type="radio" name="tipo_entrega" value="ENTREGA" checked={formData.tipo_entrega === "ENTREGA"} onChange={() => setFormData({...formData, tipo_entrega: "ENTREGA"})} /> Entregar</label>
            </div>
          </div>
          <hr style={{ border: "1px solid #899662", margin: "15px 0" }} />
          <div>
            <h3 style={{ fontWeight: "700", marginBottom: "8px" }}>ENDEREÇO DE ENTREGA:</h3>
            <label>Endereço completo (Rua e número):</label>
            <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} style={inputStyle} />
            <label>Bairro:</label>
            <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} style={inputStyle} />
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <div style={{ flex: 1 }}><label>Cidade:</label><input type="text" name="cidade" value={formData.cidade} onChange={handleChange} style={inputStyle} /></div>
              <div style={{ flex: 1 }}><label>CEP:</label><input type="text" name="cep" value={formData.cep} onChange={handleChange} style={inputStyle} /></div>
            </div>
          </div>
          <button onClick={handleSubmit} style={{ backgroundColor: "#899662", color: "#fff", fontWeight: "700", padding: "12px 20px", borderRadius: "8px", border: "none", cursor: "pointer", marginTop: "30px" }}>
            Solicitar Orçamento
          </button>
        </div>

        {/* ITENS DO CARRINHO */}
        <div style={{ gridArea: "itens", border: "1px solid #ccc", borderRadius: "8px", padding: "16px" }}>
          {itens.length === 0 ? (
            <p style={{textAlign: 'center'}}>Seu carrinho está vazio.</p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", fontWeight: "600", fontSize: "14px", borderBottom: "1px solid #899662", paddingBottom: "8px", marginBottom: "8px" }}>
                <span>Item</span>
                <span style={{textAlign: 'center'}}>Qtd</span>
                <span>Preço</span>
                <span>Total</span>
              </div>

              {itens.map((item) => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", alignItems: "center", borderBottom: "1px solid #899662", padding: "10px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src={item.imagem} alt={item.nome} style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "6px", border: "1px solid #ccc" }} />
                    <div>
                      <p style={{ fontSize: "11px", color: "#777" }}>código: {item.codigo}</p>
                      <p style={{ fontWeight: "600", margin: "4px 0", fontSize: "13px" }}>{item.nome}</p>
                    </div>
                  </div>

                  {/* SELETOR DE QUANTIDADE */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <button 
                      onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                      style={qtyBtnStyle}
                    >
                      <FiMinus size={12} />
                    </button>
                    <span style={{ fontWeight: "600" }}>{item.quantidade}</span>
                    <button 
                      onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                      style={qtyBtnStyle}
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>

                  <p style={{ fontSize: "13px" }}>R${item.preco_unitario.toFixed(2)}</p>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <p style={{fontWeight: 'bold', fontSize: "13px"}}>R${item.subtotal.toFixed(2)}</p>
                    <button onClick={() => removerItem(item.id)} style={{ background: "#899662", border: "none", borderRadius: "50%", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <FiTrash2 color="#fff" size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <div style={{textAlign: 'right', marginTop: '20px', fontSize: '18px', fontWeight: 'bold'}}>
                Total Estimado: R${total.toFixed(2)}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

const inputStyle = { width: "95%", padding: "8px", border: "1px solid #ccc", borderRadius: "6px", marginBottom: "8px", display: "block" };

// Estilo dos botões de quantidade
const qtyBtnStyle = {
  background: "#fff",
  border: "1px solid #899662",
  borderRadius: "4px",
  width: "22px",
  height: "22px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#899662"
};