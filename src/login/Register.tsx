import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { apiPublicFetch } from "../api/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
    const res = await apiPublicFetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Error al registrarse");

      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: 350,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h5">Registro</Typography>

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextField
            label="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />

          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />

          {error && (
            <Typography color="error" >
              {error}
            </Typography>
          )}

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Creando..." : "Registrarse"}
          </Button>

          <Typography
            onClick={() => navigate("/login")}
            sx={{ cursor: "pointer", textAlign: "center", fontSize: 14 }}
          >
            Ya tengo cuenta
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}