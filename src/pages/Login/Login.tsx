import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  
  // Alterado de 'user' para 'email' para corresponder à API
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); // Limpa erros anteriores
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${baseUrl}/contas/admin/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Sucesso: A API retorna os tokens JWT
        // Salva o token no localStorage para usar em outras requisições
        if (data.access) {
            localStorage.setItem("authToken", data.access);
        }
        
        // Se a API retornar refresh token, pode salvar também se necessário
        // localStorage.setItem("refreshToken", data.refresh);

        navigate("/admin/produtos");
      } else {
        // Erro: Exibe mensagem retornada pela API ou mensagem genérica
        // data.detail é comum no Django REST Framework para erros
        setError(data.detail || "E-mail ou senha incorretos.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Login Administrativo:</h2>

        <label className="label">E-mail:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="exemplo@email.com"
          required
        />

        <label className="label">Senha:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Mensagem de erro */}
        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Carregando..." : "Fazer Login"}
        </button>
      </form>
    </div>
  );
}