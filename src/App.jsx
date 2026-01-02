import React from "react";
// ALTERAÇÃO AQUI: Troquei BrowserRouter por HashRouter
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

// ---------- ADMIN ----------
import Login from "./pages/Login/Login";
import Produtos from "./pages/Dashboard/Produtos";
import EventosAdmin from "./pages/Dashboard/Eventos";
import Status from "./pages/Dashboard/Status";
import ProdutoDetalhes from "./pages/ProdutoDetalhes";

function App() {
  return (
    // O <Router> agora é um HashRouter
    <Router>
      <ScrollToTop />

      <Routes>

        {/* ================= CLIENTE ================= */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />

        <Route path="/KitDetalhes/:id" element={<><Navbar /><KitDetalhes /><Footer /></>} />
        <Route path="/carrinho" element={<><Navbar /><Carrinho /><Footer /></>} />
        <Route path="/eventos" element={<><Navbar /><EventosCliente /><Footer /></>} />
        <Route path="/kits" element={<><Navbar /><Kits /><Footer /></>} />
        <Route path="/pesquisa" element={<><Navbar /><Pesquisa /><Footer /></>} />
        <Route path="/MeusPedidos" element={<><Navbar /><MeusPedidos /><Footer /></>} />
        <Route path="/produto/:id" element={<><Navbar /><ProdutoDetalhes /><Footer /></>} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin" element={<Login />} />
        <Route path="/admin/produtos" element={<Produtos />} />
        <Route path="/admin/eventos" element={<EventosAdmin />} />
        <Route path="/admin/status" element={<Status />} />

      </Routes>
    </Router>
  );
}

export default App;