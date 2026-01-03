import React, { useState, useEffect } from "react";
import { FiTrash2, FiMinus, FiPlus, FiAlertCircle, FiCheckCircle, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Carrinho() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // --- ESTADOS DE CONTROLE VISUAL ---
  const [errosForm, setErrosForm] = useState({}); // Guarda quais campos estão inválidos
  const [modal, setModal] = useState({ open: false, tipo: "", titulo: "", mensagem: "", link: null });

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

  // --- BUSCA ITENS DO CARRINHO ---
  const fetchCarrinho = async (silent = false) => {
    const itensLocal = JSON.parse(localStorage.getItem("carrinho") || "[]");
    
    if (itensLocal.length === 0) {
      setItens([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/pedido/carrinho/detalhes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itens: itensLocal }),
      });
      const data = await response.json();
      
      setItens(data.produtos || []);
      setTotal(data.total || 0);

      // Preenche datas se vier do backend e o form estiver vazio
      if (!silent && data.produtos.length > 0) {
        setFormData(prev => ({
          ...prev,
          data_retirada: prev.data_retirada || data.produtos[0].data_retirada || "",
          data_devolucao: prev.data_devolucao || data.produtos[0].data_devolucao || "",
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarrinho();
  }, []);

  // --- ALTERAR QUANTIDADE ---
  const alterarQuantidade = (id, novaQtd) => {
    if (novaQtd < 1) return; 

    // Atualização Otimista (Visual imediato)
    const novosItens = itens.map(item => {
      if (item.id === id) {
        return { ...item, quantidade: novaQtd, subtotal: item.preco_unitario * novaQtd };
      }
      return item;
    });
    setItens(novosItens);

    const novoTotal = novosItens.reduce((acc, curr) => acc + curr.subtotal, 0);
    setTotal(novoTotal);

    // Atualiza LocalStorage
    const itensLocal = JSON.parse(localStorage.getItem("carrinho") || "[]");
    const index = itensLocal.findIndex((item) => item.id === id);
    if (index > -1) {
      itensLocal[index].quantidade = novaQtd;
      localStorage.setItem("carrinho", JSON.stringify(itensLocal));
    }
  };

  const removerItem = (id) => {
    const itensLocal = JSON.parse(localStorage.getItem("carrinho") || "[]");
    const filtrados = itensLocal.filter((item) => item.id !== id);
    localStorage.setItem("carrinho", JSON.stringify(filtrados));
    fetchCarrinho(false); 
  };

  // --- VALIDAÇÃO EM TEMPO REAL ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 1. Validação de Devolução vs Retirada
    if (name === "data_devolucao" && formData.data_retirada) {
      if (value < formData.data_retirada) {
        abrirModal("erro", "Data Inválida", "A data de devolução não pode ser anterior à data de retirada.");
        return; 
      }
    }

    // 2. Validação da Data do Evento (não pode ser antes da retirada)
    if (name === "data_evento") {
        if (formData.data_retirada && value < formData.data_retirada) {
            abrirModal("erro", "Data Inválida", "O evento não pode acontecer antes da data de retirada dos produtos.");
            return;
        }
        if (formData.data_devolucao && value > formData.data_devolucao) {
            abrirModal("erro", "Data Inválida", "O evento não pode acontecer depois da data de devolução dos produtos.");
            return;
        }
    }

    // Limpa o erro visual (vermelho) assim que o usuário digita algo
    if (errosForm[name]) {
        setErrosForm(prev => ({ ...prev, [name]: false }));
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- ENVIAR PEDIDO ---
  const handleSubmit = async () => {
    const novosErros = {};
    let temErro = false;

    // 1. Validação de Campos Obrigatórios
    if (!formData.nome.trim()) { novosErros.nome = true; temErro = true; }
    if (!formData.telefone.trim()) { novosErros.telefone = true; temErro = true; }
    if (!formData.email.trim()) { novosErros.email = true; temErro = true; }
    if (!formData.data_retirada) { novosErros.data_retirada = true; temErro = true; }
    if (!formData.data_devolucao) { novosErros.data_devolucao = true; temErro = true; }

    if (formData.tipo_entrega === "ENTREGA") {
        if (!formData.endereco.trim()) { novosErros.endereco = true; temErro = true; }
        if (!formData.bairro.trim()) { novosErros.bairro = true; temErro = true; }
        if (!formData.cidade.trim()) { novosErros.cidade = true; temErro = true; }
        if (!formData.cep.trim()) { novosErros.cep = true; temErro = true; }
    }

    if (temErro) {
      setErrosForm(novosErros);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para cima
      return;
    }

    const itensLocal = JSON.parse(localStorage.getItem("carrinho") || "[]");
    
    try {
      const response = await fetch(`${apiUrl}/pedido/carrinho/finalizar/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, itens: itensLocal }),
      });
      
      const dadosResposta = await response.json();
      
      if (response.ok) {
        // --- SUCESSO ---
        localStorage.removeItem("carrinho");
        if (dadosResposta.id) {
             const waRes = await fetch(`${apiUrl}/pedido/carrinho/${dadosResposta.id}/whatsapp/`);
             const waData = await waRes.json();
             
             abrirModal(
                 "sucesso", 
                 "Orçamento Realizado!", 
                 "Seu pedido foi salvo com sucesso.\nClique abaixo para finalizar no WhatsApp.",
                 waData.whatsapp_url
             );
        }
      } else {
        // --- TRATAMENTO DE ERROS DO SERVIDOR ---
        tratarErroServidor(dadosResposta);
      }
    } catch (error) {
      abrirModal("erro", "Erro de Conexão", "Não foi possível conectar ao servidor. Verifique sua internet.");
    }
  };

  // Função auxiliar para interpretar o erro do Django
  const tratarErroServidor = (dadosErro) => {
      let titulo = "Ops! Algo deu errado";
      let msg = "Ocorreu um erro ao processar seu pedido.";

      if (Array.isArray(dadosErro)) {
          // Erro de lista (comum no DRF)
          const textoErro = dadosErro[0];
          if (typeof textoErro === 'string' && textoErro.includes("Estoque")) {
              titulo = "Estoque Insuficiente";
              msg = "Infelizmente, não temos estoque suficiente para alguns itens do seu pedido:\n\n" + textoErro;
          } else {
              msg = textoErro;
          }
      } 
      else if (dadosErro.error) {
           msg = dadosErro.error;
      }
      else if (dadosErro.non_field_errors) {
           msg = dadosErro.non_field_errors[0];
      }

      abrirModal("erro", titulo, msg);
  };

  const abrirModal = (tipo, titulo, mensagem, link = null) => {
      setModal({ open: true, tipo, titulo, mensagem, link });
  };

  const fecharModal = () => {
      if (modal.tipo === "sucesso" && modal.link) {
          window.location.href = modal.link;
      }
      setModal({ ...modal, open: false });
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Carregando...</div>;

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 24px 80px", fontFamily: "'Inter', sans-serif", color: "#2B3A21", position: "relative" }}>
      
      {/* --- MODAL CUSTOMIZADO --- */}
      {modal.open && (
          <div style={overlayStyle}>
              <div style={modalStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                      <h3 style={{ margin: 0, color: modal.tipo === "sucesso" ? "#2B3A21" : "#D32F2F", display: "flex", alignItems: "center", gap: "10px" }}>
                          {modal.tipo === "sucesso" ? <FiCheckCircle size={28} /> : <FiAlertCircle size={28} />} 
                          {modal.titulo}
                      </h3>
                      <button onClick={fecharModal} style={{ background: "none", border: "none", cursor: "pointer" }}><FiX size={24} /></button>
                  </div>
                  
                  <p style={{ whiteSpace: "pre-line", lineHeight: "1.5", color: "#555", fontSize: "15px" }}>
                      {modal.mensagem}
                  </p>
                  
                  <button onClick={fecharModal} style={{ 
                      ...btnStyle, 
                      backgroundColor: modal.tipo === "sucesso" ? "#899662" : "#D32F2F", 
                      marginTop: "25px", 
                      width: "100%" 
                  }}>
                      {modal.tipo === "sucesso" ? "Ir para o WhatsApp" : "Entendi, vou corrigir"}
                  </button>
              </div>
          </div>
      )}

      <h1 style={{ textAlign: "center", fontSize: "26px", fontWeight: "700", marginBottom: "20px" }}>MEU CARRINHO</h1>
      <hr style={{ border: "1px solid #899662", marginBottom: "30px" }} />

      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "40px", alignItems: "flex-start", gridTemplateAreas: isMobile ? `"form" "itens"` : `"itens form"` }}>
        
        {/* FORMULÁRIO */}
        <div style={{ gridArea: "form", border: "1px solid #ccc", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", fontSize: "14px", background: "#fff" }}>
          <div>
            <h3 style={{ fontWeight: "600", marginBottom: "8px" }}>INFORMAÇÕES PESSOAIS:</h3>
            
            <label>Nome Completo: *</label>
            <input 
                type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Maria Silva" 
                style={errosForm.nome ? inputErrorStyle : inputStyle} 
            />
            {errosForm.nome && <span style={errorTextStyle}>Campo obrigatório</span>}
            
            <label>E-mail: *</label>
            <input 
                type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Ex: maria@email.com" 
                style={errosForm.email ? inputErrorStyle : inputStyle} 
            />
            {errosForm.email && <span style={errorTextStyle}>Campo obrigatório</span>}
            
            <label>Telefone (WhatsApp): *</label>
            <input 
                type="text" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(11) 99999-9999" 
                style={errosForm.telefone ? inputErrorStyle : inputStyle} 
            />
            {errosForm.telefone && <span style={errorTextStyle}>Campo obrigatório</span>}
          </div>
          
          <hr style={{ border: "1px solid #899662", margin: "15px 0" }} />
          
          <div>
            <h3 style={{ fontWeight: "700", marginBottom: "8px" }}>PERÍODO DE ALUGUEL:</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{flex: 1}}>
                <label>Data Retirada: *</label>
                <input 
                    type="date" name="data_retirada" value={formData.data_retirada} onChange={handleChange} 
                    style={errosForm.data_retirada ? inputErrorStyle : inputStyle} 
                />
                {errosForm.data_retirada && <span style={errorTextStyle}>Obrigatório</span>}
              </div>
              <div style={{flex: 1}}>
                <label>Data Devolução: *</label>
                <input 
                    type="date" name="data_devolucao" value={formData.data_devolucao} onChange={handleChange} min={formData.data_retirada}
                    style={errosForm.data_devolucao ? inputErrorStyle : inputStyle} 
                />
                {errosForm.data_devolucao && <span style={errorTextStyle}>Obrigatório</span>}
              </div>
            </div>
          </div>
          
          <hr style={{ border: "1px solid #899662", margin: "15px 0" }} />
          
          <div>
            <h3 style={{ fontWeight: "700", marginBottom: "8px" }}>INFORMAÇÕES DO EVENTO (Opcional):</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "150px" }}>
                  <label>Data do Evento:</label>
                  <input 
                    type="date" name="data_evento" value={formData.data_evento} onChange={handleChange} style={inputStyle} 
                    min={formData.data_retirada}
                    max={formData.data_devolucao}
                    disabled={!formData.data_retirada}
                    title={!formData.data_retirada ? "Defina a data de retirada primeiro" : ""}
                  />
              </div>
              <div style={{ flex: 1, minWidth: "150px" }}><label>Hora do Evento:</label><input type="time" name="hora_evento" value={formData.hora_evento} onChange={handleChange} style={inputStyle} /></div>
            </div>
          </div>
          
          <hr style={{ border: "1px solid #899662", margin: "15px 0" }} />
          
          <div>
            <h3 style={{ fontWeight: "700", marginBottom: "8px" }}>INFORMAÇÕES DE ENTREGA:</h3>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <label><input type="radio" name="tipo_entrega" value="RETIRADA" checked={formData.tipo_entrega === "RETIRADA"} onChange={() => setFormData({...formData, tipo_entrega: "RETIRADA"})} /> Retirar na Loja</label>
              <label><input type="radio" name="tipo_entrega" value="ENTREGA" checked={formData.tipo_entrega === "ENTREGA"} onChange={() => setFormData({...formData, tipo_entrega: "ENTREGA"})} /> Entregar (Frete a calcular)</label>
            </div>
          </div>

          {formData.tipo_entrega === "ENTREGA" && (
            <>
                <hr style={{ border: "1px solid #ddd", margin: "15px 0" }} />
                <div>
                    <h3 style={{ fontWeight: "700", marginBottom: "8px" }}>ENDEREÇO DE ENTREGA:</h3>
                    
                    <label>Endereço completo: *</label>
                    <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} style={errosForm.endereco ? inputErrorStyle : inputStyle} />
                    {errosForm.endereco && <span style={errorTextStyle}>Obrigatório</span>}
                    
                    <label>Bairro: *</label>
                    <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} style={errosForm.bairro ? inputErrorStyle : inputStyle} />
                    {errosForm.bairro && <span style={errorTextStyle}>Obrigatório</span>}
                    
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                        <div style={{ flex: 1 }}>
                            <label>Cidade: *</label>
                            <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} style={errosForm.cidade ? inputErrorStyle : inputStyle} />
                            {errosForm.cidade && <span style={errorTextStyle}>Obrigatório</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>CEP: *</label>
                            <input type="text" name="cep" value={formData.cep} onChange={handleChange} style={errosForm.cep ? inputErrorStyle : inputStyle} />
                            {errosForm.cep && <span style={errorTextStyle}>Obrigatório</span>}
                        </div>
                    </div>
                </div>
            </>
          )}

          <button onClick={handleSubmit} style={btnStyle}>
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

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <button 
                      onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                      style={qtyBtnStyle}
                      disabled={item.quantidade <= 1}
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

// --- ESTILOS ---
const inputStyle = { width: "95%", padding: "8px", border: "1px solid #ccc", borderRadius: "6px", marginBottom: "8px", display: "block" };
const inputErrorStyle = { ...inputStyle, border: "1px solid #D32F2F", backgroundColor: "#FFEBEE" };
const errorTextStyle = { color: "#D32F2F", fontSize: "12px", marginTop: "-5px", marginBottom: "10px", display: "block", fontWeight: "bold" };

const btnStyle = { backgroundColor: "#899662", color: "#fff", fontWeight: "700", padding: "12px 20px", borderRadius: "8px", border: "none", cursor: "pointer", marginTop: "30px", transition: "0.3s" };

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

const overlayStyle = {
  position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex", justifyContent: "center", alignItems: "center",
  zIndex: 1000
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "12px",
  width: "90%",
  maxWidth: "450px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  textAlign: "center",
  animation: "fadeIn 0.3s ease-in-out"
};