import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { supabase } from "../lib/supabase";

type FoodNutrition = {
  kcal: number;
  carbs: number;
  sugars: number;
  protein: number;
  fat: number;

  sat_fat: number;   // AGS
  mono_fat: number;  // AGM
  poly_fat: number;  // AGP

  fiber: number;
  sodium: number;
};

type FoodProduct = {
  id: string;
  name: string;
  category: string;
  food_group: string; 
  barcode: string;
  base_quantity: number;
  base_unit: string;

  food_nutrition?: FoodNutrition;
};


const nutritionFields: Record<string, string> = {
  kcal: "Kcal",
  carbs: "HC",
  sugars: "Azúcares",
  protein: "Proteína",
  fat: "Grasas",
  sat_fat: "AGS ",
  mono_fat: "AGM ",
  poly_fat: "AGP",
  fiber: "Fibra",
  sodium: "Sodio",
};

export default function FoodProductsManagement() {
  const [products, setProducts] = useState<FoodProduct[]>([]);
  const [filter, setFilter] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FoodProduct | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    barcode: "",
    food_group: "",
    kcal: 0,
    carbs: 0,
    sugars: 0,
    protein: 0,
    fat: 0,

    sat_fat: 0,
    mono_fat: 0,
    poly_fat: 0,

    fiber: 0,
    sodium: 0,

    grams: 100,
    unit: "g",
  });

  /* =========================
     LOAD
  ========================= */
  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("food_products")
      .select(`
        *,
        food_nutrition (*)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
  const normalized = data.map((p: any) => ({
    ...p,
    food_nutrition: p.food_nutrition?.[0] || null,
  }));

  setProducts(normalized);
}
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* =========================
     SAVE
  ========================= */
  const handleSave = async () => {
    if (editing) {
      await supabase
        .from("food_products")
        .update({
          name: form.name,
          category: form.category,
        food_group: form.food_group,
          barcode: form.barcode,
          base_quantity: form.grams,
          base_unit: form.unit,
        })
        .eq("id", editing.id);

      await supabase
        .from("food_nutrition")
        .update({
          kcal: form.kcal,
          carbs: form.carbs,
          sugars: form.sugars,
          protein: form.protein,
          fat: form.fat,
          sat_fat: form.sat_fat,
          mono_fat: form.mono_fat,
          poly_fat: form.poly_fat,
          fiber: form.fiber,
          sodium: form.sodium,
        })
        .eq("product_id", editing.id);

    } else {
      const { data: product } = await supabase
        .from("food_products")
        .insert([
          {
            name: form.name,
            category: form.category,
            food_group: form.food_group,
            barcode: form.barcode,
            base_quantity: form.grams,
            base_unit: form.unit,
          },
        ])
        .select()
        .single();

      if (product) {
        await supabase.from("food_nutrition").insert([
          {
            product_id: product.id,
            kcal: form.kcal,
            carbs: form.carbs,
            sugars: form.sugars,
            protein: form.protein,
            fat: form.fat,
            sat_fat: form.sat_fat,
            mono_fat: form.mono_fat,
            poly_fat: form.poly_fat,
            fiber: form.fiber,
            sodium: form.sodium,
          },
        ]);
      }
    }

    setOpen(false);
    setEditing(null);

    setForm({
      name: "",
      category: "",
      food_group: "",
      barcode: "",
      kcal: 0,
      carbs: 0,
      sugars: 0,
      protein: 0,
      fat: 0,
      sat_fat: 0,
      mono_fat: 0,
      poly_fat: 0,
      fiber: 0,
      sodium: 0,
      grams: 100,
      unit: "g",
    });

    loadProducts();
  };

  /* =========================
     EDIT
  ========================= */
  const handleEdit = (p: FoodProduct) => {
    setEditing(p);

    setForm({
      name: p.name || "",
      category: p.category || "",
      barcode: p.barcode || "",
        food_group: p.food_group || "",
      kcal: p.food_nutrition?.kcal || 0,
      carbs: p.food_nutrition?.carbs || 0,
      sugars: p.food_nutrition?.sugars || 0,
      protein: p.food_nutrition?.protein || 0,
      fat: p.food_nutrition?.fat || 0,

      sat_fat: p.food_nutrition?.sat_fat || 0,
      mono_fat: p.food_nutrition?.mono_fat || 0,
      poly_fat: p.food_nutrition?.poly_fat || 0,

      fiber: p.food_nutrition?.fiber || 0,
      sodium: p.food_nutrition?.sodium || 0,

      grams: p.base_quantity || 100,
      unit: p.base_unit || "g",
    });

    setOpen(true);
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id: string) => {
    await supabase.from("food_products").delete().eq("id", id);
    loadProducts();
  };

const filtered = products.filter((p) => {
  const q = filter.toLowerCase();

  return (
    p.name.toLowerCase().includes(q) ||
    (p.category || "").toLowerCase().includes(q) ||
    (p.food_group || "").toLowerCase().includes(q)
  );
});

  return (
    <Box>
      <Typography variant="h5">🍎 Gestión de alimentos</Typography>

      <Stack direction="row" spacing={2} sx={{ my: 2 }}>
        <TextField
          label="Buscar producto"
          fullWidth
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <Button
          variant="contained"
          onClick={() => {
            setEditing(null);
            setForm({
              name: "",
              category: "",
              barcode: "",
              food_group: "",
              kcal: 0,
              carbs: 0,
              sugars: 0,
              protein: 0,
              fat: 0,
              sat_fat: 0,
              mono_fat: 0,
              poly_fat: 0,
              fiber: 0,
              sodium: 0,
              grams: 100,
              unit: "g",
            });
            setOpen(true);
          }}
        >
          Nuevo
        </Button>
      </Stack>

      {/* LISTA */}
      <Stack spacing={1}>
        {filtered.map((p) => (
          <Paper
                key={p.id}
                sx={{
                    p: 2,
                    borderRadius: 3,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: 2,
                }}
                >
<Box sx={{ flex: 1 }}>
  <Typography >
    {p.name}
  </Typography>

  <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap" }}>
    <Typography variant="caption" sx={{ bgcolor: "#eef", px: 1, borderRadius: 1 }}>
      {p.category}
    </Typography>

    <Typography variant="caption" sx={{ bgcolor: "#efe", px: 1, borderRadius: 1 }}>
      {p.food_group}
    </Typography>
  </Stack>

  <Typography variant="caption" sx={{ mt: 1, display: "block", color: "text.secondary" }}>
    {p.base_quantity || 100}{p.base_unit || "g"} • {p.barcode}
  </Typography>
</Box>

<Box sx={{ display: "flex", gap: 2, textAlign: "center" }}>
  <Box>
    <Typography >{p.food_nutrition?.kcal || 0}</Typography>
    <Typography variant="caption">Kcal</Typography>
  </Box>

  <Box>
    <Typography >{p.food_nutrition?.protein || 0}g</Typography>
    <Typography variant="caption">Prot</Typography>
  </Box>

  <Box>
    <Typography >{p.food_nutrition?.carbs || 0}g</Typography>
    <Typography variant="caption">HC</Typography>
  </Box>

  <Box>
    <Typography>{p.food_nutrition?.fat || 0}g</Typography>
    <Typography variant="caption">Grasa</Typography>
  </Box>
</Box>



            <Box>
              <IconButton onClick={() => handleEdit(p)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(p.id)}>
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Stack>

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {editing ? "Editar alimento" : "Nuevo alimento"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nombre" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <TextField label="Supermercado" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <TextField
                label="Grupo alimenticio"
                value={form.food_group}
                onChange={(e) =>
                    setForm({ ...form, food_group: e.target.value })
                }
                />

            {/* <TextField label="Barcode" value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })} /> */}

            <TextField label="Gramos base" type="number" value={form.grams}
              onChange={(e) => setForm({ ...form, grams: Number(e.target.value) })} />

            <TextField label="Unidad" value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })} />

            <Typography>🧬 Nutrición</Typography>

           {Object.entries(nutritionFields).map(([key, label]) => (
               <TextField
                    key={key}
                    label={label}
                    type="number"
                    value={(form as any)[key]}
                    onChange={(e) =>
                    setForm({ ...form, [key]: Number(e.target.value) })
                    }
                    fullWidth
                />
            ))}
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