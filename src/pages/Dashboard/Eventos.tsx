// src/pages/Eventos.jsx
import { useState } from "react";
import Navbar from "../../components/Navbar";
import "./Dashboard.css";

export default function Eventos() {

  // -------------------------------- LISTA DE EVENTOS --------------------------------
  const [eventosLista, setEventosLista] = useState([
    { id: 1, nome: "Casamento", preco: "07,00" },
    { id: 2, nome: "Festa Infantil", preco: "05,00" },
    { id: 3, nome: "Aniversário", preco: "10,00" },
    { id: 4, nome: "Formatura", preco: "15,00" },
    { id: 5, nome: "Chá Revelação", preco: "08,00" },
  ]);

  const [filtroEvento, setFiltroEvento] = useState("");

  const eventosExibidos = eventosLista
    .filter(ev =>
      ev.nome.toLowerCase().includes(filtroEvento.toLowerCase()) ||
      ev.id.toString().includes(filtroEvento)
    )
    .slice(0, 5);


  // -------------------------------- MODAIS --------------------------------
  const [modalAdicionarEvento, setModalAdicionarEvento] = useState(false);
  const [modalEditarEvento, setModalEditarEvento] = useState(false);
  const [modalAdicionarProdutosEvento, setModalAdicionarProdutosEvento] = useState(false);

  const [eventoEditando, setEventoEditando] = useState(null);

  // -------------------------------- FORM EVENTO --------------------------------
  const [formEvento, setFormEvento] = useState({
    nome: "",
    data: "",
    descricao: "",
    preco: "",
    fotos: []
  });

  const abrirModalAdicionarEvento = () => {
    setFormEvento({
      nome: "",
      data: "",
      descricao: "",
      preco: "",
      fotos: []
    });
    setModalAdicionarEvento(true);
  };

  const abrirModalEditarEvento = (evento) => {
    setEventoEditando(evento);
    setFormEvento({
      nome: evento.nome,
      data: evento.data || "",
      descricao: evento.descricao || "",
      preco: evento.preco,
      fotos: evento.fotos || []
    });
    setModalEditarEvento(true);
  };

  const fecharModais = () => {
    setModalAdicionarEvento(false);
    setModalEditarEvento(false);
    setModalAdicionarProdutosEvento(false);
    setEventoEditando(null);
  };


  // -------------------------------- CRUD EVENTO --------------------------------
  const adicionarEvento = () => {
    if (!formEvento.nome) return;

    const novoId = eventosLista.length
      ? Math.max(...eventosLista.map(e => e.id)) + 1
      : 1;

    const novoEvento = {
      id: novoId,
      nome: formEvento.nome,
      data: formEvento.data,
      descricao: formEvento.descricao,
      preco: formEvento.preco,
      fotos: formEvento.fotos || []
    };

    setEventosLista(prev => [...prev, novoEvento]);
    fecharModais();
  };

  const salvarAlteracaoEvento = () => {
    if (!eventoEditando) return;

    const alterado = eventosLista.map(ev =>
      ev.id === eventoEditando.id
        ? { ...ev, ...formEvento }
        : ev
    );

    setEventosLista(alterado);
    fecharModais();
  };

  const excluirEvento = (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este evento?")) return;
    setEventosLista(prev => prev.filter(ev => ev.id !== id));
  };


  // -------------------------------- PRODUTOS PARA EVENTO --------------------------------
  const [produtosLista] = useState([
    { id: 1, nome: "Prato azul de cerâmica", preco: "07,00", qtd: 100 },
    { id: 2, nome: "Prato de sobremesa floral", preco: "05,00", qtd: 500 },
    { id: 3, nome: "Copo de vidro decorado", preco: "04,00", qtd: 200 },
    { id: 4, nome: "Taça cristal simples", preco: "09,00", qtd: 50 },
    { id: 5, nome: "Taça cristal premium", preco: "15,00", qtd: 20 },
  ]);

  const [filtroProdutosEvento, setFiltroProdutosEvento] = useState("");

  const produtosFiltrados = produtosLista.filter(p =>
    p.nome.toLowerCase().includes(filtroProdutosEvento.toLowerCase())
  );

  function atualizarQtdEvento(id, qtd) {
    console.log("Produto", id, "Quantidade adicionada:", qtd);
  }


  return (
    <div className="dashboard-page">

      {/* NAVBAR */}
      <Navbar />

      <div className="green-bar"></div>

      <div className="dashboard-content">

        {/* -------------------------------- LISTA DE EVENTOS -------------------------------- */}
        <section className="event-box">
          <div className="box-header">
            <h3>Eventos</h3>

            <div className="actions-right">
              <input
                type="text"
                placeholder="Pesquisar evento..."
                value={filtroEvento}
                onChange={(e) => setFiltroEvento(e.target.value)}
              />
              <button onClick={abrirModalAdicionarEvento}>Adicionar Evento</button>
            </div>
          </div>

          <table className="eventos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Imagem</th>
                <th>Tipo de Evento</th>
                <th>Preço</th>
                <th>Produtos</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {eventosExibidos.map((ev) => (
                <tr key={ev.id}>
                  <td>{ev.id}</td>
                  <td><img src="/img/produto1.png" alt="evento" /></td>
                  <td>{ev.nome}</td>
                  <td>R$ {ev.preco}</td>

                  <td>
                    <button
                      onClick={() => {
                        setEventoEditando(ev);
                        setModalAdicionarProdutosEvento(true);
                      }}
                    >
                      + Produtos
                    </button>
                  </td>

                  <td className="icons">
                    <span onClick={() => abrirModalEditarEvento(ev)}>✏️</span>
                    <span onClick={() => excluirEvento(ev.id)}>🗑️</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </section>
      </div>


      {/* =================================================================================== */}
      {/* ---------------------------- MODAL ADICIONAR EVENTO ------------------------------ */}
      {/* =================================================================================== */}
      {modalAdicionarEvento && (
        <div className="modal-bg" onClick={fecharModais}>
          <div className="modal-evento" onClick={(e) => e.stopPropagation()}>

            <h2>Adicionar Evento</h2>

            <label>Nome:</label>
            <input
              type="text"
              value={formEvento.nome}
              onChange={(e) => setFormEvento({ ...formEvento, nome: e.target.value })}
            />

            <label>Data:</label>
            <input
              type="date"
              value={formEvento.data}
              onChange={(e) => setFormEvento({ ...formEvento, data: e.target.value })}
            />

            <label>Descrição:</label>
            <textarea
              value={formEvento.descricao}
              onChange={(e) => setFormEvento({ ...formEvento, descricao: e.target.value })}
            />

            <label>Preço:</label>
            <input
              type="text"
              value={formEvento.preco}
              onChange={(e) => setFormEvento({ ...formEvento, preco: e.target.value })}
            />

            <label>Fotos:</label>
            <div
              className="upload-area"
              onClick={() => document.getElementById("input-fotos-evento")?.click()}
            >
              <p>Clique para selecionar</p>
              <small>
                {formEvento.fotos.length
                  ? `${formEvento.fotos.length} arquivo(s)`
                  : "Nenhum arquivo selecionado"}
              </small>
            </div>

            <input
              id="input-fotos-evento"
              type="file"
              multiple
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) =>
                setFormEvento({
                  ...formEvento,
                  fotos: e.target.files ? Array.from(e.target.files) : [],
                })
              }
            />

            <button className="btn-confirmar" onClick={adicionarEvento}>
              Adicionar
            </button>

          </div>
        </div>
      )}


      {/* =================================================================================== */}
      {/* ------------------------------ MODAL EDITAR EVENTO -------------------------------- */}
      {/* =================================================================================== */}
      {modalEditarEvento && (
        <div className="modal-bg" onClick={fecharModais}>
          <div className="modal-evento" onClick={(e) => e.stopPropagation()}>

            <h2>Editar Evento</h2>

            <label>Nome:</label>
            <input
              type="text"
              value={formEvento.nome}
              onChange={(e) => setFormEvento({ ...formEvento, nome: e.target.value })}
            />

            <label>Data:</label>
            <input
              type="date"
              value={formEvento.data}
              onChange={(e) => setFormEvento({ ...formEvento, data: e.target.value })}
            />

            <label>Descrição:</label>
            <textarea
              value={formEvento.descricao}
              onChange={(e) => setFormEvento({ ...formEvento, descricao: e.target.value })}
            />

            <label>Preço:</label>
            <input
              type="text"
              value={formEvento.preco}
              onChange={(e) => setFormEvento({ ...formEvento, preco: e.target.value })}
            />

            <button className="btn-confirmar" onClick={salvarAlteracaoEvento}>
              Salvar Alteração
            </button>

          </div>
        </div>
      )}


      {/* =================================================================================== */}
      {/* -------------------------- MODAL ADICIONAR PRODUTOS AO EVENTO --------------------- */}
      {/* =================================================================================== */}
      {modalAdicionarProdutosEvento && (
        <div className="modal-bg" onClick={fecharModais}>
          <div className="modal-produtos-evento" onClick={(e) => e.stopPropagation()}>

            <h2>Adicionar Produtos ao Evento</h2>

            {/* Barra de busca */}
            <div className="busca-container">
              <input
                type="text"
                placeholder="Pesquisar produto..."
                value={filtroProdutosEvento}
                onChange={(e) => setFiltroProdutosEvento(e.target.value)}
              />
            </div>

            {/* Tabela de produtos */}
            <table className="tabela-produtos-evento">
              <thead>
                <tr>
                  <th>Imagem</th>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>Qtd</th>
                </tr>
              </thead>

              <tbody>
                {produtosFiltrados.map((p) => (
                  <tr key={p.id}>
                    <td><img src="/img/produto1.png" /></td>
                    <td>{p.nome}</td>
                    <td>R$ {p.preco}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        defaultValue={1}
                        onChange={(e) => atualizarQtdEvento(p.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="btn-confirmar">
              Adicionar ao Evento
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
