import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
// import Home from "./pages/Home";
// import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>
      {/* Conteúdo das páginas */}
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<About />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
