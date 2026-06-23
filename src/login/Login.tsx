import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPublicFetch } from "../api/api";
import { supabase } from "../lib/supabase";

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Link,
  CircularProgress,
} from "@mui/material";
import logo from "../../public/nued.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

useEffect(() => {
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      navigate("/dashboard");
    }
  };

  checkSession();
}, []);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    navigate("/dashboard");
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
        background: "linear-gradient(135deg, #e3f2fd, #f5f5f5)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: 360,
          p: 4,
          borderRadius: 3,
        }}
      >
        <form onSubmit={handleLogin}>
          <Stack spacing={2}>
            {/* LOGO */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <img src={logo} alt="logo" style={{ width: 70 }} />
            </Box>

            <Typography variant="h5" >
              Iniciar sesión
            </Typography>

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

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              sx={{
                py: 1.2,
                fontWeight: 600,
              }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Entrar"
              )}
            </Button>

            <Typography >
              ¿No tienes cuenta?{" "}
              <Link
                component="button"
                onClick={() => navigate("/register")}
                underline="hover"
              >
                Regístrate
              </Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}