import React, { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

export default function Carrinho() {
  const [itens, setItens] = useState([
    {
      id: 1,
      codigo: "001",
      nome: "Produto",
      preco: 31.0,
      qtd: 2,
      imagem: "/images/kit1.jpg",
      diametro: "—",
    },
    {
      id: 2,
      codigo: "002",
      nome: "Produto",
      preco: 31.0,
      qtd: 2,
      imagem: "/images/kit1.jpg",
      diametro: "—",
    },
    {
      id: 3,
      codigo: "003",
      nome: "Produto",
      preco: 31.0,
      qtd: 2,
      imagem: "/images/kit1.jpg",
      diametro: "—",
    },
  ]);

  const removerItem = (id) => {
    setItens(itens.filter((item) => item.id !== id));
  };

  return (
    <>
      {/* <Navbar /> */}

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 80px",
          fontFamily: "'Inter', sans-serif",
          color: "#2B3A21",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "26px",
            fontWeight: "700",
            marginBottom: "20px",
          }}
        >
          MEU CARRINHO
        </h1>

        <hr style={{ border: "1px solid #899662", marginBottom: "30px" }} />

        {/* Grid principal */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "40px",
            alignItems: "flex-start",
          }}
        >
          {/* --- LADO ESQUERDO: Itens do carrinho --- */}
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                fontWeight: "600",
                fontSize: "14px",
                borderBottom: "1px solid #899662",
                paddingBottom: "8px",
                marginBottom: "8px",
              }}
            >
              <span>Item</span>
              <span>Qtd</span>
              <span>Preço</span>
              <span>Total</span>
            </div>

            {itens.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  alignItems: "center",
                  borderBottom: "1px solid #899662",
                  padding: "10px 0",
                }}
              >
                {/* Coluna 1: imagem + info */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src={item.imagem}
                    alt={item.nome}
                    style={{
                      width: "70px",
                      height: "70px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                    }}
                  />
                  <div>
                    <p style={{ fontSize: "12px", color: "#777" }}>código: {item.codigo}</p>
                    <p style={{ fontWeight: "600", margin: "4px 0" }}>{item.nome}</p>
                    <p style={{ fontSize: "12px", color: "#777" }}>
                      Diâmetro: {item.diametro}
                    </p>
                  </div>
                </div>

                {/* Coluna 2: qtd */}
                <p>{item.qtd}</p>

                {/* Coluna 3: preço unitário */}
                <p>xR${item.preco.toFixed(2)}</p>

                {/* Coluna 4: total + lixeira */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <p>R${(item.qtd * item.preco).toFixed(2)}</p>
                  <button
                    onClick={() => removerItem(item.id)}
                    style={{
                      background: "#899662",
                      border: "none",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <FiTrash2 color="#fff" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* --- LADO DIREITO: Formulário --- */}
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              // gap: "18px",
              fontSize: "14px",
            }}
          >
            <div>
              <h3 style={{ fontWeight: "600", marginBottom: "8px" }}>
                INFORMAÇÕES PESSOAIS:
              </h3>
              <label>Nome Completo:</label>
              <input
                type="text"
                style={{
                  width: "95%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  marginBottom: "8px",
                }}
              />
              <label>Telefone:</label>
              <input
                type="text"
                style={{
                  width: "95%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                }}
              />
            </div>

            <hr style={{ border: "1px solid #899662" }} />

            <div>
              <h3 style={{ fontWeight: "700", marginBottom: "8px" }}>
                INFORMAÇÕES DO EVENTO:
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label>Data do Evento:</label>
                  <input
                    type="date"
                    style={{
                      width: "90%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Hora do Evento:</label>
                  <input
                    type="time"
                    style={{
                      width: "90%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                    }}
                  />
                </div>
              </div>
            </div>

            <hr style={{ border: "1px solid #899662" }} />

            <div>
              <h3 style={{ fontWeight: "700", marginBottom: "8px" }}>
                INFORMAÇÕES DE ENTREGA:
              </h3>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <label>
                  <input type="radio" name="entrega" /> Retirar na Loja
                </label>
                <label>
                  <input type="radio" name="entrega" /> Entregar
                </label>
              </div>
            </div>

            <hr style={{ border: "1px solid #899662" }} />

            <div>
              <h3 style={{ fontWeight: "700", marginBottom: "8px" }}>
                ENDEREÇO DE ENTREGA:
              </h3>
              <label>Bairro:</label>
              <input
                type="text"
                style={{
                  width: "95%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                }}
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <div style={{ flex: 1 }}>
                  <label>Cidade:</label>
                  <input
                    type="text"
                    style={{
                      width: "85%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                    }}
                  />
                </div>
                <div style={{ flex: "1" }}>
                  <label>Número:</label>
                  <input
                    type="text"
                    style={{
                      width: "90%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: "8px" }}>
                <label>Complemento:</label>
                <input
                  type="text"
                  style={{
                    width: "95%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                  }}
                />
              </div>
                
            </div>

            <button
              style={{
                backgroundColor: "#899662",
                color: "#fff",
                fontWeight: "700",
                padding: "12px 20px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                marginTop: "30px",
              }}
            >
              Solicitar Orçamento
            </button>
          </div>
        </section>
      </main>

      {/* <Footer /> */}
    </>
  );
}
