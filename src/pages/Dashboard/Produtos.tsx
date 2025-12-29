// import { useState } from "react";
// import "./Dashboard.css";

// export default function Dashboard() {

//   // -------------------------- PRODUTOS (estado inicial a partir da sua lista) --------------------------
//   const [produtosLista, setProdutosLista] = useState([
//     { id: 1, nome: "Prato azul de cerâmica", preco: "07,00", qtd: 100 },
//     { id: 2, nome: "Prato de sobremesa floral", preco: "05,00", qtd: 500 },
//     { id: 3, nome: "Copo de vidro decorado", preco: "04,00", qtd: 200 },
//     { id: 4, nome: "Taça cristal simples", preco: "09,00", qtd: 50 },
//     { id: 5, nome: "Taça cristal premium", preco: "15,00", qtd: 20 },
//     { id: 6, nome: "Colher dourada", preco: "03,50", qtd: 400 },
//     { id: 7, nome: "Garfo dourado", preco: "03,50", qtd: 400 },
//     { id: 8, nome: "Faca dourada", preco: "04,50", qtd: 300 },
//     { id: 9, nome: "Guardanapo floral", preco: "02,00", qtd: 800 },
//     { id: 10, nome: "Guardanapo verde oliva", preco: "02,50", qtd: 750 },
//     { id: 11, nome: "Jarra transparente", preco: "12,00", qtd: 60 },
//     { id: 12, nome: "Jarra listrada", preco: "14,00", qtd: 35 },
//     { id: 13, nome: "Cadeira de madeira", preco: "30,00", qtd: 25 },
//     { id: 14, nome: "Mesa de apoio pequena", preco: "45,00", qtd: 10 },
//     { id: 15, nome: "Mesa grande de jantar", preco: "95,00", qtd: 8 }
//   ]);

//   const [filtroProduto, setFiltroProduto] = useState("");

//   const produtosExibidos = produtosLista
//     .filter(p =>
//       p.nome.toLowerCase().includes(filtroProduto.toLowerCase()) ||
//       p.id.toString().includes(filtroProduto)
//     )
//     .slice(0, 5);


//   // -------------------------- EVENTOS (estado inicial igual ao seu) --------------------------
//   const [eventosLista, setEventosLista] = useState([
//     { id: 1, nome: "Casamento", preco: "07,00" },
//     { id: 2, nome: "Festa Infantil", preco: "05,00" },
//     { id: 3, nome: "Aniversário", preco: "10,00" },
//     { id: 4, nome: "Formatura", preco: "15,00" },
//     { id: 5, nome: "Chá Revelação", preco: "08,00" },
//     { id: 6, nome: "Chá Bar", preco: "07,50" },
//     { id: 7, nome: "Bodas", preco: "12,00" },
//     { id: 8, nome: "Evento Corporativo Evento Corporativo", preco: "20,00" },
//     { id: 9, nome: "Palestra", preco: "18,00" },
//     { id: 10, nome: "Workshop", preco: "14,00" },
//     { id: 11, nome: "Feira Gastronômica", preco: "30,00" },
//     { id: 12, nome: "Jantar Social", preco: "25,00" },
//     { id: 13, nome: "Show Musical", preco: "40,00" },
//     { id: 14, nome: "Desfile de Moda", preco: "35,00" },
//     { id: 15, nome: "Evento Escolar", preco: "06,00" }
//   ]);

//   const [filtroEvento, setFiltroEvento] = useState("");

//   const eventosExibidos = eventosLista
//     .filter(e =>
//       e.nome.toLowerCase().includes(filtroEvento.toLowerCase()) ||
//       e.id.toString().includes(filtroEvento)
//     )
//     .slice(0, 5);


//   // -------------------------- MODAIS E CONTROLES --------------------------
//   // PRODUTOS
//   const [modalAdicionarProduto, setModalAdicionarProduto] = useState(false);
//   const [modalEditarProduto, setModalEditarProduto] = useState(false);
//   const [produtoEditando, setProdutoEditando] = useState(null);

//   // EVENTOS
//   const [modalAdicionarEvento, setModalAdicionarEvento] = useState(false);
//   const [modalEditarEvento, setModalEditarEvento] = useState(false);
//   const [eventoEditando, setEventoEditando] = useState(null);
//   const [modalAdicionarProdutosEvento, setModalAdicionarProdutosEvento] = useState(false);
//   const [filtroProdutosEvento, setFiltroProdutosEvento] = useState("");
  
//   function atualizarQtdEvento(id, qtd) {
//     console.log("Produto", id, "Quantidade", qtd);
//   }

//   // form de produto (usado tanto para adicionar quanto para editar)
//   const [formProduto, setFormProduto] = useState({
//     nome: "",
//     descricao: "",
//     preco: "",
//     qtd: "",
//     categoria: "",
//     cor: "",
//     fotos: [] // <-- armazena File[] (não serializado) enquanto estiver no front
//   });

//   // FORM DE EVENTO
//   const [formEvento, setFormEvento] = useState({
//     nome: "",
//     data: "",
//     descricao: "",
//     preco: "",
//     fotos: []
//   });


//   // -------------------------- FUNÇÕES - PRODUTOS --------------------------
//   const abrirModalAdicionarProduto = () => {
//     setFormProduto({
//       nome: "",
//       descricao: "",
//       preco: "",
//       qtd: "",
//       categoria: "",
//       cor: "",
//       fotos: []
//     });
//     setModalAdicionarProduto(true);
//   };

//   const abrirModalEditarProduto = (produto) => {
//     setProdutoEditando(produto);
//     setFormProduto({
//       nome: produto.nome ?? "",
//       descricao: produto.descricao ?? "",
//       preco: produto.preco ?? "",
//       qtd: produto.qtd ?? "",
//       categoria: produto.categoria ?? "",
//       cor: produto.cor ?? "",
//       fotos: produto.fotos ?? []
//     });
//     setModalEditarProduto(true);
//   };

//   const fecharModais = () => {
//     // fecha todos
//     setModalAdicionarProduto(false);
//     setModalEditarProduto(false);
//     setProdutoEditando(null);

//     setModalAdicionarEvento(false);
//     setModalEditarEvento(false);
//     setEventoEditando(null);
//   };

//   // Adicionar produto: cria objeto com id único e atualiza estado
//   const adicionarProduto = () => {
//     // validação simples opcional
//     if (!formProduto.nome) {
//       return;
//     }

//     const novoId = produtosLista.length > 0
//       ? Math.max(...produtosLista.map(p => p.id)) + 1
//       : 1;

//     const novoProduto = {
//       id: novoId,
//       nome: formProduto.nome,
//       descricao: formProduto.descricao,
//       preco: formProduto.preco,
//       qtd: Number(formProduto.qtd) || 0,
//       categoria: formProduto.categoria,
//       cor: formProduto.cor,
//       fotos: formProduto.fotos || [] // armazena os File objects (front-end)
//     };

//     setProdutosLista(prev => [...prev, novoProduto]);
//     fecharModais();
//   };

//   // Salvar alteração do produto editado
//   const salvarAlteracaoProduto = () => {
//     if (!produtoEditando) return;

//     const atualizado = produtosLista.map(p =>
//       p.id === produtoEditando.id
//         ? {
//             ...p,
//             nome: formProduto.nome,
//             descricao: formProduto.descricao,
//             preco: formProduto.preco,
//             qtd: Number(formProduto.qtd) || 0,
//             categoria: formProduto.categoria,
//             cor: formProduto.cor,
//             fotos: formProduto.fotos || p.fotos || []
//           }
//         : p
//     );

//     setProdutosLista(atualizado);
//     fecharModais();
//   };

//   // -------------------------- FUNÇÕES - EVENTOS (mantive simples, igual antes) --------------------------
//   const abrirModalAdicionarEvento = () => {
//     setModalAdicionarEvento(true);
//   };

//   const abrirModalEditarEvento = (evento) => {
//     setEventoEditando(evento);
//     setModalEditarEvento(true);
//   };

//   // adicionar evento simples (pode expandir depois)
//   const adicionarEvento = () => {
//     const novoId = eventosLista.length > 0
//       ? Math.max(...eventosLista.map(e => e.id)) + 1
//       : 1;

//     const novoEv = {
//       id: novoId,
//       nome: formProduto.nome || "Novo Evento",
//       preco: formProduto.preco || "0,00"
//     };

//     setEventosLista(prev => [...prev, novoEv]);
//     fecharModais();
//   };

//   const salvarAlteracaoEvento = () => {
//     if (!eventoEditando) return;
//     fecharModais();
//   };

//   // -------------------------- EXCLUIR PRODUTO --------------------------
//   const excluirProduto = (id) => {
//     const confirmado = window.confirm("Tem certeza que deseja excluir este produto?");
//     if (!confirmado) return;

//     setProdutosLista((prev) => prev.filter(p => p.id !== id));
//   };

//   // -------------------------- EXCLUIR EVENTO --------------------------
//   const excluirEvento = (id) => {
//     const confirmado = window.confirm("Tem certeza que deseja excluir este evento?");
//     if (!confirmado) return;

//     setEventosLista((prev) => prev.filter(ev => ev.id !== id));
//   };

//   // -------------------------- RENDER --------------------------
//   return (
//     <div className="dashboard-page">

//       <nav className="top-nav">
//         <a href="#">Status</a>
//         <a href="#">Eventos e Produtos</a>
//       </nav>

//       <div className="green-bar"></div>

//       <div className="dashboard-content">

//         {/* -------------------------- PRODUTOS -------------------------- */}
//         <section className="table-box">
//           <div className="box-header">
//             <h3>Produtos</h3>

//             <div className="actions-right">
//               <input
//                 type="text"
//                 placeholder="Pesquisar produto..."
//                 value={filtroProduto}
//                 onChange={(e) => setFiltroProduto(e.target.value)}
//               />
//               <button onClick={abrirModalAdicionarProduto}>Adicionar Produto</button>
//             </div>
//           </div>

//           <table>
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Imagem</th>
//                 <th>Nome</th>
//                 <th>Preço</th>
//                 <th>Quantidade</th>
//                 <th>Ações</th>
//               </tr>
//             </thead>

//             <tbody>
//               {produtosExibidos.map((p) => (
//                 <tr key={p.id}>
//                   <td>{p.id}</td>
//                   <td><img src="/img/produto1.png" alt="produto" /></td>
//                   <td>{p.nome}</td>
//                   <td>R$ {p.preco}</td>
//                   <td>{p.qtd}</td>
//                   <td className="icons">
//                     <span onClick={() => abrirModalEditarProduto(p)}>✏️</span>
//                     <span onClick={() => excluirProduto(p.id)} style={{cursor: "pointer"}}>🗑️</span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </section>

//         {/* -------------------------- EVENTOS -------------------------- */}
//         <section className="event-box">
//           <div className="box-header">
//             <h3>Eventos</h3>

//             <div className="actions-right">
//               <input
//                 type="text"
//                 placeholder="Pesquisar evento..."
//                 value={filtroEvento}
//                 onChange={(e) => setFiltroEvento(e.target.value)}
//               />
//               <button onClick={abrirModalAdicionarEvento}>Adicionar Evento</button>
//             </div>
//           </div>

//           <table className="eventos-table">
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Imagem</th>
//                 <th>Tipo de Evento</th>
//                 <th>Preço</th>
//                 <th>Ações</th>
//               </tr>
//             </thead>

//             <tbody>
//               {eventosExibidos.map((ev) => (
//                 <tr key={ev.id}>
//                   <td>{ev.id}</td>
//                   <td><img src="/img/produto1.png" alt="evento" /></td>
//                   <td>{ev.nome}</td>
//                   <td>R$ {ev.preco}</td>
//                   <td className="icons">
//                     <span onClick={() => abrirModalEditarEvento(ev)}>✏️</span>
//                     <span onClick={() => excluirEvento(ev.id)} style={{cursor: "pointer"}}>🗑️</span>
//                   </td>

//                 </tr>
//               ))}
//             </tbody>
//           </table>

//         </section>

//       </div>

//       {/* -------------------------- MODAL ADICIONAR PRODUTO -------------------------- */}
//       {modalAdicionarProduto && (
//         <div className="modal-bg" onClick={fecharModais}>
//           <div className="modal-produto" onClick={(e) => e.stopPropagation()}>

//             <h2>Adicionar Produto:</h2>

//             <label>Nome do Produto:</label>
//             <input
//               type="text"
//               value={formProduto.nome}
//               onChange={(e) => setFormProduto({...formProduto, nome: e.target.value})}
//             />

//             <label>Descrição do Produto:</label>
//             <textarea
//               value={formProduto.descricao}
//               onChange={(e) => setFormProduto({...formProduto, descricao: e.target.value})}
//             />

//             <label>Adicionar Fotos:</label>

//             <div
//               className="upload-area"
//               onClick={() => {
//                 const el = document.getElementById("input-fotos-produto");
//                 if (el) el.click();
//               }}
//             >
//               <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
//                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginBottom: 6}}>
//                   <path d="M4 7H6L7 5H17L18 7H20C21.1 7 22 7.9 22 9V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V9C2 7.9 2.9 7 4 7Z" stroke="#555" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M8 13C9.10457 13 10 12.1046 10 11C10 9.89543 9.10457 9 8 9C6.89543 9 6 9.89543 6 11C6 12.1046 6.89543 13 8 13Z" stroke="#555" strokeWidth="1.2"/>
//                 </svg>
//                 <p style={{margin:0}}>Clique para escolher fotos (múltiplas)</p>
//                 <small style={{color:"#666"}}>{formProduto.fotos && formProduto.fotos.length > 0 ? `${formProduto.fotos.length} arquivo(s) selecionado(s)` : "Nenhuma foto selecionada"}</small>
//               </div>
//             </div>

//             <input
//               id="input-fotos-produto"
//               type="file"
//               multiple
//               accept="image/*"
//               style={{ display: "none" }}
//               onChange={(e) => {
//                 const files = e.target.files ? Array.from(e.target.files) : [];
//                 setFormProduto({...formProduto, fotos: files});
//               }}
//             />

//             <div className="linha-dupla">
//               <div>
//                 <label>Preço:</label>
//                 <input
//                   type="text"
//                   value={formProduto.preco}
//                   onChange={(e) => setFormProduto({...formProduto, preco: e.target.value})}
//                 />
//               </div>

//               <div>
//                 <label>Quantidade:</label>
//                 <input
//                   type="number"
//                   value={formProduto.qtd}
//                   onChange={(e) => setFormProduto({...formProduto, qtd: e.target.value})}
//                 />
//               </div>
//             </div>

//             <div className="linha-dupla">
//               <div>
//                 <label>Categoria:</label>
//                 <select
//                   value={formProduto.categoria}
//                   onChange={(e) => setFormProduto({...formProduto, categoria: e.target.value})}
//                 >
//                   <option value="">Selecione</option>
//                   <option>Pratos</option>
//                   <option>Taças</option>
//                   <option>Guarda Napos</option>
//                   <option>Talheres</option>
//                 </select>
//               </div>

//               <div>
//                 <label>Cor:</label>
//                 <select
//                   value={formProduto.cor}
//                   onChange={(e) => setFormProduto({...formProduto, cor: e.target.value})}
//                 >
//                   <option value="">Selecione</option>
//                   <option>Azul</option>
//                   <option>Rosa</option>
//                   <option>Branco</option>
//                 </select>
//               </div>
//             </div>

//             <button className="btn-confirmar" onClick={adicionarProduto}>Adicionar</button>
//           </div>
//         </div>
//       )}

//       {/* -------------------------- MODAL EDITAR PRODUTO -------------------------- */}
//       {modalEditarProduto && (
//         <div className="modal-bg" onClick={fecharModais}>
//           <div className="modal-produto" onClick={(e) => e.stopPropagation()}>

//             <h2>Editar Produto:</h2>

//             <label>Nome do Produto:</label>
//             <input
//               type="text"
//               value={formProduto.nome}
//               onChange={(e) => setFormProduto({...formProduto, nome: e.target.value})}
//             />

//             <label>Descrição do Produto:</label>
//             <textarea
//               value={formProduto.descricao}
//               onChange={(e) => setFormProduto({...formProduto, descricao: e.target.value})}
//             />

//             <div className="linha-dupla">
//               <div>
//                 <label>Preço:</label>
//                 <input
//                   type="text"
//                   value={formProduto.preco}
//                   onChange={(e) => setFormProduto({...formProduto, preco: e.target.value})}
//                 />
//               </div>

//               <div>
//                 <label>Quantidade:</label>
//                 <input
//                   type="number"
//                   value={formProduto.qtd}
//                   onChange={(e) => setFormProduto({...formProduto, qtd: e.target.value})}
//                 />
//               </div>
//             </div>

//             <button className="btn-confirmar" onClick={salvarAlteracaoProduto}>Salvar Alteração</button>
//           </div>
//         </div>
//       )}

//       {/* -------------------------- MODAL ADICIONAR EVENTO (NOVO) -------------------------- */}
//       {modalAdicionarEvento && (
//         <div className="modal-bg" onClick={fecharModais}>
//           <div className="modal-evento" onClick={(e) => e.stopPropagation()}>

//             <h2>Adicionar Evento:</h2>

//             <label>Nome do Evento:</label>
//             <input
//               type="text"
//               value={formEvento.nome}
//               onChange={(e) => setFormEvento({ ...formEvento, nome: e.target.value })}
//             />

//             <label>Data:</label>
//             <input
//               type="date"
//               value={formEvento.data}
//               onChange={(e) => setFormEvento({ ...formEvento, data: e.target.value })}
//             />

//             <label>Descrição:</label>
//             <textarea
//               value={formEvento.descricao}
//               onChange={(e) => setFormEvento({ ...formEvento, descricao: e.target.value })}
//             />

//             <label>Adicionar Fotos:</label>
//             <div
//               className="upload-area"
//               onClick={() => document.getElementById("input-fotos-evento")?.click()}
//             >
//               <p style={{ margin: 0 }}>Clique para escolher fotos</p>
//               <small style={{ color: "#666" }}>
//                 {formEvento.fotos?.length
//                   ? `${formEvento.fotos.length} arquivo(s) selecionado(s)`
//                   : "Nenhuma foto selecionada"}
//               </small>
//             </div>

//             <input
//               id="input-fotos-evento"
//               type="file"
//               multiple
//               accept="image/*"
//               style={{ display: "none" }}
//               onChange={(e) =>
//                 setFormEvento({
//                   ...formEvento,
//                   fotos: e.target.files ? Array.from(e.target.files) : [],
//                 })
//               }
//             />

//             <label>Preço:</label>
//             <input
//               type="text"
//               value={formEvento.preco}
//               onChange={(e) => setFormEvento({ ...formEvento, preco: e.target.value })}
//             />

//             <button className="btn-confirmar" onClick={adicionarEvento}>
//               Adicionar
//             </button>

//           </div>
//         </div>
//       )}

//       {/* -------------------------- MODAL EDITAR EVENTO (NOVO) -------------------------- */}
//       {modalEditarEvento && (
//         <div className="modal-bg" onClick={fecharModais}>
//           <div className="modal-evento" onClick={(e) => e.stopPropagation()}>

//             <h2>Editar Evento:</h2>

//             <label>Nome do Evento:</label>
//             <input
//               type="text"
//               value={formEvento.nome}
//               onChange={(e) => setFormEvento({ ...formEvento, nome: e.target.value })}
//             />

//             <label>Data:</label>
//             <input
//               type="date"
//               value={formEvento.data}
//               onChange={(e) => setFormEvento({ ...formEvento, data: e.target.value })}
//             />

//             <label>Descrição:</label>
//             <textarea
//               value={formEvento.descricao}
//               onChange={(e) => setFormEvento({ ...formEvento, descricao: e.target.value })}
//             />

//             <label>Preço:</label>
//             <input
//               type="text"
//               value={formEvento.preco}
//               onChange={(e) => setFormEvento({ ...formEvento, preco: e.target.value })}
//             />

//             <button className="btn-confirmar" onClick={salvarAlteracaoEvento}>
//               Salvar Alteração
//             </button>

//           </div>
//         </div>
//       )}

//       {/* -------------------------- MODAL ADICIONAR PRODUTOS AO EVENTO -------------------------- */}
//       {modalAdicionarProdutosEvento && (
//         <div className="modal-bg" onClick={fecharModais}>
//           <div className="modal-produtos-evento" onClick={(e) => e.stopPropagation()}>

//             <h2>Adicionar Produtos ao Evento:</h2>

//             {/* Barra de busca */}
//             <div className="busca-container">
//               <input
//                 type="text"
//                 placeholder="Pesquisar produto..."
//                 value={filtroProdutosEvento}
//                 onChange={(e) => setFiltroProdutosEvento(e.target.value)}
//               />
//               <button className="btn-add-produto" onClick={abrirModalAdicionarProduto}>+</button>
//             </div>

//             {/* Tabela */}
//             <table className="tabela-produtos-evento">
//               <thead>
//                 <tr>
//                   <th>Imagem</th>
//                   <th>Nome</th>
//                   <th>Preço</th>
//                   <th>Qtd</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {produtosExibidos.map((p) => (
//                   <tr key={p.id}>
//                     <td><img src="/img/produto1.png" /></td>
//                     <td>{p.nome}</td>
//                     <td>R$ {p.preco}</td>
//                     <td>
//                       <input
//                         type="number"
//                         min="1"
//                         defaultValue={1}
//                         onChange={(e) => atualizarQtdEvento(p.id, e.target.value)}
//                       />
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             <button className="btn-confirmar">Adicionar ao Evento</button>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// src/pages/Produtos.jsx
import { useState } from "react";
import Navbar from "../../components/Navbar";
import "./Dashboard.css";

export default function Produtos() {

  // -------------------------------- PRODUTOS --------------------------------
  const [produtosLista, setProdutosLista] = useState([
    { id: 1, nome: "Prato azul de cerâmica", preco: "07,00", qtd: 100 },
    { id: 2, nome: "Prato de sobremesa floral", preco: "05,00", qtd: 500 },
    { id: 3, nome: "Copo de vidro decorado", preco: "04,00", qtd: 200 },
    { id: 4, nome: "Taça cristal simples", preco: "09,00", qtd: 50 },
    { id: 5, nome: "Taça cristal premium", preco: "15,00", qtd: 20 },
  ]);

  const [filtroProduto, setFiltroProduto] = useState("");

  const produtosExibidos = produtosLista
    .filter(p =>
      p.nome.toLowerCase().includes(filtroProduto.toLowerCase()) ||
      p.id.toString().includes(filtroProduto)
    )
    .slice(0, 5);

  // --------------------------- MODAIS ---------------------------
  const [modalAdicionarProduto, setModalAdicionarProduto] = useState(false);
  const [modalEditarProduto, setModalEditarProduto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

  // --------------------------- FORM PRODUTO ---------------------------
  const [formProduto, setFormProduto] = useState({
    nome: "",
    descricao: "",
    preco: "",
    qtd: "",
    categoria: "",
    cor: "",
    fotos: []
  });

  const abrirModalAdicionarProduto = () => {
    setFormProduto({
      nome: "",
      descricao: "",
      preco: "",
      qtd: "",
      categoria: "",
      cor: "",
      fotos: []
    });
    setModalAdicionarProduto(true);
  };

  const abrirModalEditarProduto = (produto) => {
    setProdutoEditando(produto);
    setFormProduto({
      nome: produto.nome,
      descricao: produto.descricao || "",
      preco: produto.preco,
      qtd: produto.qtd,
      categoria: produto.categoria || "",
      cor: produto.cor || "",
      fotos: produto.fotos || []
    });
    setModalEditarProduto(true);
  };

  const fecharModais = () => {
    setModalAdicionarProduto(false);
    setModalEditarProduto(false);
    setProdutoEditando(null);
  };

  const adicionarProduto = () => {
    if (!formProduto.nome) return;

    const novoId = produtosLista.length
      ? Math.max(...produtosLista.map(p => p.id)) + 1
      : 1;

    const novoProduto = {
      id: novoId,
      nome: formProduto.nome,
      descricao: formProduto.descricao,
      preco: formProduto.preco,
      qtd: Number(formProduto.qtd) || 0,
      categoria: formProduto.categoria,
      cor: formProduto.cor,
      fotos: formProduto.fotos || []
    };

    setProdutosLista(prev => [...prev, novoProduto]);
    fecharModais();
  };

  const salvarAlteracaoProduto = () => {
    if (!produtoEditando) return;

    const atualizado = produtosLista.map(p =>
      p.id === produtoEditando.id
        ? { ...p, ...formProduto, qtd: Number(formProduto.qtd) }
        : p
    );

    setProdutosLista(atualizado);
    fecharModais();
  };

  const excluirProduto = (id) => {
    if (!window.confirm("Excluir produto?")) return;
    setProdutosLista(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}
      <Navbar />

      <div className="green-bar"></div>

      <div className="dashboard-content">

        <section className="table-box">
          <div className="box-header">
            <h3>Produtos</h3>

            <div className="actions-right">
              <input
                type="text"
                placeholder="Pesquisar produto..."
                value={filtroProduto}
                onChange={(e) => setFiltroProduto(e.target.value)}
              />
              <button onClick={abrirModalAdicionarProduto}>Adicionar Produto</button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Imagem</th>
                <th>Nome</th>
                <th>Preço</th>
                <th>Quantidade</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {produtosExibidos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><img src="/img/produto1.png" alt="produto" /></td>
                  <td>{p.nome}</td>
                  <td>R$ {p.preco}</td>
                  <td>{p.qtd}</td>
                  <td className="icons">
                    <span onClick={() => abrirModalEditarProduto(p)}>✏️</span>
                    <span onClick={() => excluirProduto(p.id)}>🗑️</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* --------------------------- MODAL ADICIONAR --------------------------- */}
      {modalAdicionarProduto && (
        <div className="modal-bg" onClick={fecharModais}>
          <div className="modal-produto" onClick={(e) => e.stopPropagation()}>

            <h2>Adicionar Produto:</h2>

            <label>Nome:</label>
            <input
              type="text"
              value={formProduto.nome}
              onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
            />

            <label>Descrição:</label>
            <textarea
              value={formProduto.descricao}
              onChange={(e) => setFormProduto({ ...formProduto, descricao: e.target.value })}
            />

            <label>Fotos:</label>
            <div className="upload-area" onClick={() => document.getElementById("input-fotos-prod").click()}>
              <p>Clique para enviar fotos</p>
              <small>
                {formProduto.fotos.length
                  ? `${formProduto.fotos.length} foto(s)`
                  : "Nenhuma foto selecionada"}
              </small>
            </div>

            <input
              id="input-fotos-prod"
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={(e) =>
                setFormProduto({ ...formProduto, fotos: Array.from(e.target.files) })
              }
            />

            <button className="btn-confirmar" onClick={adicionarProduto}>
              Adicionar
            </button>

          </div>
        </div>
      )}

      {/* --------------------------- MODAL EDITAR --------------------------- */}
      {modalEditarProduto && (
        <div className="modal-bg" onClick={fecharModais}>
          <div className="modal-produto" onClick={(e) => e.stopPropagation()}>

            <h2>Editar Produto</h2>

            <label>Nome:</label>
            <input
              value={formProduto.nome}
              onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
            />

            <label>Descrição:</label>
            <textarea
              value={formProduto.descricao}
              onChange={(e) => setFormProduto({ ...formProduto, descricao: e.target.value })}
            />

            <label>Preço:</label>
            <input
              value={formProduto.preco}
              onChange={(e) => setFormProduto({ ...formProduto, preco: e.target.value })}
            />

            <label>Quantidade:</label>
            <input
              type="number"
              value={formProduto.qtd}
              onChange={(e) => setFormProduto({ ...formProduto, qtd: e.target.value })}
            />

            <button className="btn-confirmar" onClick={salvarAlteracaoProduto}>
              Salvar Alteração
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
