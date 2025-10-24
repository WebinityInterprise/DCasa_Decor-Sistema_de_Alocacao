import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import KitDetalhes from "./pages/KitDetalhes";
import Carrinho from "./pages/Carrinho";
import Eventos from "./pages/Eventos";
import Kits from "./pages/Kits";

function App() {
    return (
        <Router>
            <ScrollToTop /> {/* 👈 Garante que a tela comece do topo a cada mudança de rota */}
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/KitDetalhes" element={<KitDetalhes />} />
                <Route path="/Carrinho" element={<Carrinho />} />
                <Route path="/Eventos" element={<Eventos />} />
                <Route path="/Kits" element={<Kits />} />
            </Routes>

            <Footer />
        </Router>
    );
}

export default App;
