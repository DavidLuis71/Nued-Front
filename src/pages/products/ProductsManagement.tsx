import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiFetch } from "../../api/api";


type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  vat_percent: number;
  stock: number;
  minimum_stock: number;
  active: boolean;
};

const emptyForm = {
  name: "",
  description: "",
  price: 0,
  vat_percent: 21,
  stock: 0,
  minimum_stock: 0,
  active: true,
};

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  /* =========================
     FETCH
  ========================= */
  const fetchProducts = async () => {
    const res = await apiFetch("/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =========================
     OPEN CREATE
  ========================= */
  const handleOpenCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(true);
  };

  /* =========================
     OPEN EDIT
  ========================= */
  const handleEdit = (product: Product) => {
    setForm(product);
    setEditingId(product.id);
    setOpen(true);
  };

  /* =========================
     SAVE (CREATE / UPDATE)
  ========================= */
  const handleSave = async () => {
    if (editingId) {
      await apiFetch(`/products/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await apiFetch("/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setOpen(false);
    fetchProducts();
  };

  /* =========================
     DELETE (SOFT DELETE)
  ========================= */
  const handleDelete = async (id: string) => {
    await apiFetch(`/products/${id}`, {
      method: "DELETE",
    });

    fetchProducts();
  };

  /* =========================
     UI
  ========================= */
  return (
    <Box sx={{ maxWidth: 1000, mx: "auto" }}>
      {/* HEADER */}
            <Stack
            direction="row"
            sx={{
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
            }}
            >
        <Typography variant="h5">📦 Productos</Typography>

        <Button variant="contained" onClick={handleOpenCreate}>
          + Nuevo producto
        </Button>
      </Stack>

      {/* LISTA */}
      <Stack spacing={2}>
        {products.map((p) => (
<Paper
  key={p.id}
  sx={{
    p: 2,
    borderRadius: 3,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  {/* LEFT */}
  <Box sx={{ flex: 1 }}>
    <Typography variant="subtitle1">
      {p.name}
    </Typography>

    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
      {p.description}
    </Typography>

    <Typography variant="body2">
      💰 {p.price}€ · IVA {p.vat_percent}% · Stock: {p.stock}
    </Typography>

    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
      {p.active ? (
        <Chip label="Activo" color="success" size="small" />
      ) : (
        <Chip label="Inactivo" size="small" />
      )}

      {p.stock <= p.minimum_stock && (
        <Chip label="Stock bajo" color="warning" size="small" />
      )}
    </Stack>
  </Box>

  {/* RIGHT ACTIONS */}
  <Stack direction="row" spacing={1}>
    <IconButton onClick={() => handleEdit(p)}>
      <EditIcon />
    </IconButton>

    <IconButton color="error" onClick={() => handleDelete(p.id)}>
      <DeleteIcon />
    </IconButton>
  </Stack>
</Paper>
        ))}
      </Stack>

      {/* =========================
          MODAL CREATE / EDIT
      ========================= */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {editingId ? "Editar producto" : "Nuevo producto"}
        </DialogTitle>

        <DialogContent>
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
              label="Precio"
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
            />

            <TextField
              label="IVA %"
              type="number"
              value={form.vat_percent}
              onChange={(e) =>
                setForm({
                  ...form,
                  vat_percent: Number(e.target.value),
                })
              }
            />

            <TextField
              label="Stock"
              type="number"
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: Number(e.target.value) })
              }
            />

            <TextField
              label="Stock mínimo"
              type="number"
              value={form.minimum_stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  minimum_stock: Number(e.target.value),
                })
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                />
              }
              label="Activo"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}