import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api";

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  birth_date?: string;
  height_cm?: number;
  weight_kg?: number;
};

export default function Patients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

const [form, setForm] = useState({
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  birth_date: "",
  height_cm: "",
  weight_kg: "",
   gender: "",
});

  // 🔄 GET pacientes (BACKEND)
  const fetchPatients = async () => {
    try {
        const res = await apiFetch("/patients");
      const data = await res.json();

      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // ➕ CREATE paciente (BACKEND)
const createPatient = async () => {
  try {
    const payload = {
      ...form,
      birth_date: form.birth_date || null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
    };

    const res = await apiFetch("/patients", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data?.message || "Error creating patient");
    }

    setOpen(false);

    setForm({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      birth_date: "",
      height_cm: "",
      weight_kg: "",
      gender:"",
    });

    fetchPatients();
  } catch (error) {
    console.error("Error creating patient:", error);
  }
};

  // 🔍 filtro frontend
  const filtered = patients.filter((p) =>
    `${p.first_name} ${p.last_name} ${p.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Box
     sx={{
      width: "100%",
      maxWidth: "100%",
      overflowX: "hidden",
    }}>
      {/* HEADER */}
    <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
  <Box>
    <Typography variant="h4" >
      Pacientes
    </Typography>

    <Typography variant="body2" color="text.secondary">
      Gestiona los pacientes de tu consulta
    </Typography>
  </Box>

  <Button variant="contained" color="primary"  onClick={() => setOpen(true)}>
    + Nuevo paciente
  </Button>
</Box>

      {/* BUSCADOR */}
    <Box sx={{ mb: 2 }}>
  <TextField
    fullWidth
    placeholder="Buscar por nombre, teléfono o email..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    sx={{
  background: "white",
  borderRadius: 2,
}}
  />
</Box>

      {/* TABLA */}
      <Paper
            sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                overflowX: "auto",
            }}
            >
        <Table>
         <TableHead>
            <TableRow
                sx={{
                backgroundColor: "rgba(0,0,0,0.02)",
                }}
            >
                <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
            </TableRow>
            </TableHead>

          <TableBody>
            {filtered.map((p) => (
              <TableRow
                key={p.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/patients/${p.id}`)}
              >
                <TableCell>
                  {p.first_name} {p.last_name}
                </TableCell>
                <TableCell>{p.phone}</TableCell>
                <TableCell>{p.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* MODAL CREAR */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Nuevo paciente</DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            fullWidth
            label="Nombre"
            sx={{ mt: 1 }}
            value={form.first_name}
            onChange={(e) =>
              setForm({ ...form, first_name: e.target.value })
            }
          />

          <TextField
            fullWidth
            label="Apellidos"
            sx={{ mt: 2 }}
            value={form.last_name}
            onChange={(e) =>
              setForm({ ...form, last_name: e.target.value })
            }
          />

          <TextField
            fullWidth
            label="Teléfono"
            sx={{ mt: 2 }}
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <TextField
            fullWidth
            label="Email"
            sx={{ mt: 2 }}
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

              <TextField
                fullWidth
                label="Fecha de nacimiento"
                type="date"
                value={form.birth_date}
                onChange={(e) =>
                  setForm({ ...form, birth_date: e.target.value })
                }
              />

              <TextField
                fullWidth
                label="Altura (cm)"
                type="number"
                slotProps={{
                  htmlInput: {
                    min: 1,
                    max: 500,
                    step: 0.1,
                  },
                }}
                value={form.height_cm}
                onChange={(e) =>
                  setForm({ ...form, height_cm: e.target.value })
                }
              />

              <TextField
                fullWidth
                label="Peso (kg)"
                type="number"
                value={form.weight_kg}
                onChange={(e) =>
                  setForm({ ...form, weight_kg: e.target.value })
                }
/>
<FormControl fullWidth>
  <InputLabel>Sexo</InputLabel>
  <Select
    value={form.gender}
    label="Sexo"
    onChange={(e) =>
      setForm({ ...form, gender: e.target.value })
    }
  >
    <MenuItem value="male">Hombre</MenuItem>
    <MenuItem value="female">Mujer</MenuItem>
    <MenuItem value="other">Otro</MenuItem>
    <MenuItem value="unknown">No especificado</MenuItem>
  </Select>
</FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
         <Button onClick={() => setOpen(false)} sx={{ textTransform: "none" }}>
            Cancelar
            </Button>
          <Button variant="contained" onClick={createPatient}>
            Crear
          </Button>
         
        </DialogActions>
      </Dialog>
    </Box>
  );
}