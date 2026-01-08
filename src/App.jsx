import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// ---------- CLIENTE ----------
import Home from "./pages/Home";
import KitDetalhes from "./pages/KitDetalhes";
import Carrinho from "./pages/Carrinho";
import EventosCliente from "./pages/Eventos";
import Kits from "./pages/Kits";
import Pesquisa from "./pages/Pesquisa";
import MeusPedidos from "./pages/MeusPedidos";
import ProdutoDetalhes from "./pages/ProdutoDetalhes";
import EventoDetalhes from "./pages/EventoDetalhes";

// AQUI ESTÁ A CORREÇÃO: Importamos com um nome específico para o Cliente
import ProdutosCliente from "./pages/Produtos"; 

// ---------- ADMIN ----------
import Login from "./pages/Login/Login";
// AQUI ESTÁ A CORREÇÃO: Importamos com um nome específico para o Admin
import ProdutosAdmin from "./pages/Dashboard/Produtos"; 
import EventosAdmin from "./pages/Dashboard/Eventos";
import Status from "./pages/Dashboard/Status";


function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* ================= CLIENTE ================= */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/KitDetalhes/:id" element={<><Navbar /><KitDetalhes /><Footer /></>} />
        <Route path="/carrinho" element={<><Navbar /><Carrinho /><Footer /></>} />
        <Route path="/eventos" element={<><Navbar /><EventosCliente /><Footer /></>} />
        <Route path="/kits" element={<><Navbar /><Kits /><Footer /></>} />
        <Route path="/pesquisa" element={<><Navbar /><Pesquisa /><Footer /></>} />
        <Route path="/MeusPedidos" element={<><Navbar /><MeusPedidos /><Footer /></>} />
        <Route path="/produtoDetalhes/:id" element={<><Navbar /><ProdutoDetalhes /><Footer /></>} />
        <Route path="/evento/:id" element={<><Navbar /><EventoDetalhes /><Footer /></>} />
         
        {/* ROTA CORRIGIDA: Usa ProdutosCliente e inclui Navbar */}
        <Route path="/produto" element={<><Navbar /><ProdutosCliente /><Footer /></>} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin" element={<Login />} />
        
        {/* ROTA CORRIGIDA: Usa ProdutosAdmin */}
        <Route path="/admin/produtos" element={<ProdutosAdmin />} />
        
        <Route path="/admin/eventos" element={<EventosAdmin />} />
        <Route path="/admin/status" element={<Status />} />
      </Routes>
    </Router>
  );
}

export default App;