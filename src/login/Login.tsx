import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPublicFetch } from "../api/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) navigate("/dashboard");
}, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const res = await apiPublicFetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Error al iniciar sesión");
      }

      // guardamos token
      localStorage.setItem("token", data.session.access_token);

      // opcional: guardar user
      localStorage.setItem("user", JSON.stringify(data.user));

      // redirigir
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          padding: 30,
          background: "white",
          borderRadius: 10,
          width: 320,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: 10 }}>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />

        {error && (
          <p style={{ color: "red", fontSize: 12 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 10,
            borderRadius: 6,
            border: "none",
            background: loading ? "#999" : "#2d6cdf",
            color: "white",
            cursor: "pointer",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p
  onClick={() => navigate("/register")}
  style={{
    marginTop: 10,
    fontSize: 13,
    color: "#2d6cdf",
    cursor: "pointer",
    textAlign: "center",
  }}
>
  ¿No tienes cuenta? Regístrate
</p>
    </div>
  );
}