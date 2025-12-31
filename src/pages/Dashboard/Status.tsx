import { useState } from "react";
import "./Dashboard.css";
import Navbar from "@/components/Navbar";

export default function Status() {
  const [search, setSearch] = useState("");

  const [eventos, setEventos] = useState([
    {
      id: "01",
      nome: "Casamento",
      preco: "R$ 1700,00",
      status: "Reservado",
      entrega: "06/12/2025",
      devolucao: "06/14/2025",
      cliente: "Maria Joana de Lurdes",
      contato: "(84) 99999-9999",
      endereco: "Rua Joaquim Torquato, N12",
    },
    {
      id: "02",
      nome: "Aniversário",
      preco: "R$ 900,00",
      status: "Reservado",
      entrega: "07/02/2025",
      devolucao: "07/03/2025",
      cliente: "João Marcos",
      contato: "(84) 98888-7777",
      endereco: "Av. Brasil, 320",
    },
    {
      id: "03",
      nome: "Formatura",
      preco: "R$ 2500,00",
      status: "Aguardando",
      entrega: "09/20/2025",
      devolucao: "09/23/2025",
      cliente: "Ana Clara Santos",
      contato: "(84) 99900-1122",
      endereco: "Rua Rio Branco, 1000",
    },
  ]);

  // 🔍 FILTRO DE BUSCA
  const eventosFiltrados = eventos.filter(ev =>
    ev.nome.toLowerCase().includes(search.toLowerCase()) ||
    ev.id.includes(search) ||
    ev.cliente.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">    
      {/* NAVBAR */}
        <Navbar />
    
        <div className="green-bar"></div>
    
        <div className="dashboard-content">
          <div className="monitorar-container">

            <div className="monitorar-box">

              <h3 className="monitorar-title">Monitorar Eventos</h3>

              {/* Barra de busca */}
              <div className="top-search">
                <div className="search-wrapper">
                  <input
                    type="text"
                    placeholder="Pesquisar evento..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  {/* Ícone da lupa */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m1.1-5.4a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Tabela */}
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome do Evento</th>
                    <th>Preço</th>
                    <th>Status</th>
                    <th>Data de Entrega/Devolução</th>
                    <th>Nome do Cliente</th>
                    <th>Contato</th>
                    <th>Endereço do Evento</th>
                  </tr>
                </thead>

                <tbody>
                  {eventosFiltrados.map((ev) => (
                    <tr key={ev.id}>
                      <td>{ev.id}</td>
                      <td>{ev.nome}</td>
                      <td>{ev.preco}</td>
                      <td>
                        <span className={`status-tag ${ev.status === "Reservado" ? "reservado" : "andamento"}`}>
                          {ev.status}
                        </span>
                      </td>
                      <td>
                        {ev.entrega} - {ev.devolucao}
                      </td>
                      <td>{ev.cliente}</td>
                      <td>{ev.contato}</td>
                      <td>{ev.endereco}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </div>

  );
}
