import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { apiFetch } from "../api/api";

type AppointmentType = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  active: boolean;
};

export default function AppointmentTypesSettings() {
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    duration_minutes: 30,
  });

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: 0,
    duration_minutes: 30,
    active: true,
  });

  /* =========================
     FETCH TYPES
  ========================= */
  const fetchTypes = async () => {
    const res = await apiFetch("/appointment-types");
    const data = await res.json();
    setTypes(data);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  /* =========================
     CREATE TYPE
  ========================= */
  const createType = async () => {
    if (!form.name) return;

    await apiFetch("/appointment-types", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({
      name: "",
      description: "",
      price: 0,
      duration_minutes: 30,
    });

    fetchTypes();
  };

  /* =========================
     UPDATE TYPE
  ========================= */
  const updateType = async (id: string) => {
    await apiFetch(`/appointment-types/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editForm),
    });

    setEditingId(null);
    fetchTypes();
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Typography variant="h5" >
        ⚙️ Tipos de cita
      </Typography>

      {/* =========================
          CREATE FORM
      ========================= */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" >
          Crear nuevo tipo
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Nombre"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <TextField
            label="Descripción"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <TextField
            label="Precio (€)"
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
          />

          <TextField
            label="Duración (min)"
            type="number"
            value={form.duration_minutes}
            onChange={(e) =>
              setForm({
                ...form,
                duration_minutes: Number(e.target.value),
              })
            }
          />

          <Button variant="contained" onClick={createType}>
            Crear tipo
          </Button>
        </Stack>
      </Paper>

      {/* =========================
          LIST
      ========================= */}
      <Stack spacing={2}>
        {types.map((t) => (
          <Paper
            key={t.id}
            sx={{
              p: 2,
              borderRadius: 3,
              transition: "0.2s",
              "&:hover": {
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              },
            }}
          >
            {editingId === t.id ? (
              /* =========================
                 EDIT MODE
              ========================= */
              <Stack spacing={2}>
                <TextField
                  label="Nombre"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      name: e.target.value,
                    })
                  }
                />

                <TextField
                  label="Descripción"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      description: e.target.value,
                    })
                  }
                />

                <TextField
                  label="Precio"
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      price: Number(e.target.value),
                    })
                  }
                />

                <TextField
                  label="Duración"
                  type="number"
                  value={editForm.duration_minutes}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      duration_minutes: Number(e.target.value),
                    })
                  }
                />

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<CheckIcon />}
                    onClick={() => updateType(t.id)}
                  >
                    Guardar
                  </Button>

                  <Button
                    startIcon={<CloseIcon />}
                    onClick={() => setEditingId(null)}
                  >
                    Cancelar
                  </Button>
                </Stack>
              </Stack>
            ) : (
              /* =========================
                 VIEW MODE
              ========================= */
              <Box>
           <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                  <Box>
                    <Typography variant="h6">
                      {t.name}
                    </Typography>

                    <Typography color="text.secondary">
                      {t.description}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      💰 {t.price}€ · ⏱ {t.duration_minutes} min
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <IconButton
                      onClick={() => {
                        setEditingId(t.id);
                        setEditForm({
                          name: t.name,
                          description: t.description,
                          price: t.price,
                          duration_minutes: t.duration_minutes,
                          active: t.active,
                        });
                      }}
                    >
                      <EditIcon />
                    </IconButton>

                  </Stack>
                </Stack>
              </Box>
            )}

            <Divider sx={{ mt: 2 }} />
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}