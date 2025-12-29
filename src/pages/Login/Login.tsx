import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (user === "Iandra" && password === "123") {
      navigate("/Produtos");
    } else {
      setError("Usuário ou senha incorretos.");
    }
  }

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Login Administrativo:</h2>

        <label className="label">Usuário:</label>
        <input
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />

        <label className="label">Senha:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Mensagem de erro */}
        {error && <p className="error">{error}</p>}

        <button type="submit">Fazer Login</button>
      </form>
    </div>
  );
}
