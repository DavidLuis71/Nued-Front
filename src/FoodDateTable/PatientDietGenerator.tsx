import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Button,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  Snackbar,
} from "@mui/material";
import { apiFetch } from "../api/api";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { getCircularImage } from "../helpers/utils";


/* ---------------- TYPES ---------------- */

type Food = {
  id: string;
  name: string;
  food_group?: string | null;
  category?: string | null;
  brand?: string | null;
  food_nutrition?: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
};

type MealItem = {
  id: string;
  food: Food;
  grams: number;
};

type Meal = {
  meal_type: string;
  items: MealItem[];
};

type DayPlan = {
  day_of_week: number;
  meals: Meal[];
};

/* ---------------- CONSTANTS ---------------- */

const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const MEALS = ["desayuno", "media_mañana", "comida", "merienda", "cena"];

const mealLabels: Record<string, string> = {
  desayuno: "🌅 Desayuno",
  media_mañana: "☕ Media mañana",
  comida: "🍽️ Comida",
  merienda: "🥪 Merienda",
  cena: "🌙 Cena",
};

const mealColors: Record<string, string> = {
  desayuno: "#ff9800",
  media_mañana: "#9c27b0",
  comida: "#4caf50",
  merienda: "#2196f3",
  cena: "#3f51b5",
};

/* ---------------- COMPONENT ---------------- */

export default function DietCreator() {
  const { id: patientId } = useParams();
  const navigate = useNavigate();

  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [category, setCategory] = useState("");

  const [activeDay, setActiveDay] = useState(0);

  const [target, setTarget] = useState<any>(null);
const [patient, setPatient] = useState<any>(null);
  const [selectedMeal, setSelectedMeal] = useState<string>("desayuno");
  const [modalOpen, setModalOpen] = useState(false);
const [pendingFood, setPendingFood] = useState<Food | null>(null);
const [pendingMeal, setPendingMeal] = useState<string>("desayuno");
const [pendingGrams, setPendingGrams] = useState<number>(100);
const [saving, setSaving] = useState(false);

const [shoppingOpen, setShoppingOpen] = useState(false);
const [snackbar, setSnackbar] = useState<{
  open: boolean;
  message: string;
  severity: "success" | "error";
}>({
  open: false,
  message: "",
  severity: "success",
});

  const [plan, setPlan] = useState<DayPlan[]>(
    Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      meals: MEALS.map((m) => ({
        meal_type: m,
        items: [],
      })),
    }))
  );


  const pdfRef = useRef<HTMLDivElement>(null);

//   const exportToPDF = async () => {
//   if (!pdfRef.current) return;

//   const canvas = await html2canvas(pdfRef.current, {
//     scale: 2,
//     useCORS: true,
//   });

//   const imgData = canvas.toDataURL("image/png");

//   const pdf = new jsPDF("p", "mm", "a4");

//   const pageWidth = pdf.internal.pageSize.getWidth();
//   const pageHeight = pdf.internal.pageSize.getHeight();

//   const imgHeight = (canvas.height * pageWidth) / canvas.width;

//   // 🧠 HEADER
//   const logo = "/nued.jpg";

//   pdf.addImage(logo, "JPG", 10, 8, 20, 20);

//   pdf.setFontSize(18);
//   pdf.text("Lista de la compra", 40, 20);

//   // línea separadora
//   pdf.setLineWidth(0.5);
//   pdf.line(10, 32, pageWidth - 10, 32);

//   // contenido
//   let y = 40;

//   if (imgHeight < pageHeight) {
//     pdf.addImage(imgData, "PNG", 10, y, pageWidth - 20, imgHeight);
//   } else {
//     let heightLeft = imgHeight;
//     let position = y;

//     pdf.addImage(imgData, "PNG", 10, position, pageWidth - 20, imgHeight);

//     while (heightLeft > 0) {
//       position -= pageHeight;
//       pdf.addPage();
//       pdf.addImage(imgData, "PNG", 10, position, pageWidth - 20, imgHeight);
//       heightLeft -= pageHeight;
//     }
//   }

//   pdf.save("lista-compra.pdf");
// };
const exportToPDF = async () => {
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();

  // 🔵 COLORES EMPRESA (RGB desde tus theme rgba)
const primary: [number, number, number] = [67, 88, 143];
const secondary: [number, number, number] = [99, 187, 188];

  // 🖼️ LOGO (public)
  const logo = "/nued.jpg";
 const circularLogo = await getCircularImage(logo, 80);
  // =========================
  // HEADER BONITO
  // =========================

  // barra superior
  pdf.setFillColor(...primary);
  pdf.rect(0, 0, pageWidth, 30, "F");

  // logo
  pdf.addImage(circularLogo, "JPG", 10, 6, 18, 18);

  // título
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
 const patientName = patient
  ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
  : "Paciente";

pdf.text(`Lista de la compra - ${patientName}`, 32, 18);

  // subtítulo opcional
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("@nued.nutricion", 32, 24);

  // línea inferior decorativa
  pdf.setDrawColor(...secondary);
  pdf.setLineWidth(1);
  pdf.line(0, 30, pageWidth, 30);

  // reset estilos
  pdf.setTextColor(0, 0, 0);

  // =========================
  // CONTENIDO
  // =========================

  let y = 40;

  shoppingListGrouped.forEach((group) => {
    // salto de página
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }

    // título grupo
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...primary);
    pdf.text(group.group, 10, y);

    y += 6;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);

    group.items.forEach((item) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(
        `• ${item.food.name} (${Math.round(item.grams)} g)`,
        12,
        y
      );

      y += 5;
    });

    y += 4;
  });
const safeName = (patientName || "paciente")
  .toLowerCase()
  .trim()
  .replace(/\s+/g, "-")
  .replace(/[^a-z0-9\-]/g, "");


  pdf.save(`lista-compra-${safeName}.pdf`);
};

  useEffect(() => {
  const fetchPlan = async () => {
    if (!patientId) return;

    try {
      const res = await apiFetch(`/nutrition/diet/${patientId}`);
      const data = await res.json();

      if (data?.plan) {
        setPlan(data.plan); 
      }
    } catch (err) {
      console.error("Error obteniendo dieta:", err);
    }
  };

  fetchPlan();
}, [patientId]);


useEffect(() => {
  const fetchPatient = async () => {
    if (!patientId) return;

    try {
      const res = await apiFetch(`/patients/${patientId}`);
      const data = await res.json();
      setPatient(data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchPatient();
}, [patientId]);

const handleSavePlan = async () => {
  if (!patientId) return;

  try {
    setSaving(true);

    const res = await apiFetch("/nutrition/save-diet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patient_id: patientId,
        plan,
      }),
    });

    if (!res.ok) {
      throw new Error("Error guardando el plan");
    }

    await res.json();

    setSnackbar({
      open: true,
      message: "Plan guardado correctamente",
      severity: "success",
    });

  } catch (err: any) {
    setSnackbar({
      open: true,
      message: err.message || "Error guardando el plan",
      severity: "error",
    });

  } finally {
    setSaving(false);
  }
};
  /* ---------------- LOAD PLAN ---------------- */

  useEffect(() => {
    const fetchPlan = async () => {
      if (!patientId) return;

      try {
        const res = await apiFetch(`/nutrition/last-plan/${patientId}`);
        const data = await res.json();
        setTarget(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlan();
  }, [patientId]);

  /* ---------------- FETCH FOODS ---------------- */

  const fetchFoods = async () => {
    try {
      const res = await apiFetch(
        `/nutrition/foods/search?q=${search}&group=${group}&category=${category}`
      );
      const data = await res.json();
      setFoods(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [search, group, category]);

  /* ---------------- FILTERS ---------------- */

const groups = useMemo(() => {
  return Array.from(
    new Set(
      foods
        .map(f => f.food_group)
        .filter(Boolean) as string[]
    )
  );
}, [foods]);

const categories = useMemo(() => {
  return Array.from(
    new Set(
      foods.map(f => f.category).filter(Boolean) as string[]
    )
  );
}, [foods]);

  const getNutrition = (food: Food) => food.food_nutrition?.[0];


const shoppingListGrouped = useMemo(() => {
  const map = new Map<
    string,
    {
      food: Food;
      grams: number;
    }
  >();

  plan.forEach((day) => {
    day.meals.forEach((meal) => {
      meal.items.forEach((item) => {
        const key = item.food.id;

        if (!map.has(key)) {
          map.set(key, {
            food: item.food,
            grams: 0,
          });
        }

        map.get(key)!.grams += item.grams;
      });
    });
  });

  // ahora agrupamos por food_group
  const groupMap = new Map<
    string,
    { group: string; items: { food: Food; grams: number }[] }
  >();

  map.forEach((value) => {
    const group = value.food.food_group ?? "Sin grupo";

    if (!groupMap.has(group)) {
      groupMap.set(group, { group, items: [] });
    }

    groupMap.get(group)!.items.push(value);
  });

  return Array.from(groupMap.values()).sort((a, b) =>
    a.group.localeCompare(b.group)
  );
}, [plan]);

  /* ---------------- ADD FOOD ---------------- */

const addFood = () => {
  if (!pendingFood) return;

  setPlan((prev) => {
    const copy = structuredClone(prev);

    const meal = copy[activeDay].meals.find(
      (m) => m.meal_type === pendingMeal
    );

    if (!meal) return prev;

    meal.items.push({
      id: crypto.randomUUID(),
      food: pendingFood,
      grams: pendingGrams,
    });

    return copy;
  });

  setModalOpen(false);
  setPendingFood(null);
};

  const removeItem = (mealType: string, itemId: string) => {
    setPlan((prev) => {
      const copy = structuredClone(prev);

      const meal = copy[activeDay].meals.find(
        (m) => m.meal_type === mealType
      );

      if (!meal) return prev;

      meal.items = meal.items.filter((i) => i.id !== itemId);

      return copy;
    });
  };

  /* ---------------- TOTALS ---------------- */

  const totals = useMemo(() => {
    const day = plan[activeDay];

    let kcal = 0;
    let p = 0;
    let c = 0;
    let f = 0;

    day.meals.forEach((m) => {
      m.items.forEach((i) => {
        const n = getNutrition(i.food);
        if (!n) return;

        const factor = i.grams / 100;

        kcal += n.kcal * factor;
        p += n.protein * factor;
        c += n.carbs * factor;
        f += n.fat * factor;
      });
    });

    return { kcal, p, c, f };
  }, [plan, activeDay]);

  const diff = useMemo(() => {
    return {
      kcal: totals.kcal - (target?.target_kcal ?? 0),
      p: totals.p - (target?.protein_g ?? 0),
      c: totals.c - (target?.carbs_g ?? 0),
      f: totals.f - (target?.fat_g ?? 0),
    };
  }, [totals, target]);

  /* ---------------- UI ---------------- */

  return (
    <Box
        sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            p: { xs: 1, md: 2 },
        }}
        >

      {/* LEFT */}
      <Box sx={{ width: { xs: "100%", md: "24%" } }}>
        <Box sx={{ mb: 2 }}>

                 <Button
                          startIcon={<ArrowBackIcon />}
                          variant="outlined"
                          onClick={() =>     navigate(`/patients/${patientId}/diet`)}
                        >
                Volver al cálculo nutricional
            </Button>
            </Box>
        <Typography variant="h6">Alimentos</Typography>

        <TextField
          fullWidth
          label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mt: 1 }}
        />

        <TextField
          select
          fullWidth
          label="Grupo"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          sx={{ mt: 1 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {groups.map((g) => (
            <MenuItem key={g} value={g}>
              {g}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ mt: 1 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ mt: 2, maxHeight: 600, overflow: "auto" }}>
          {foods.map((food) => (
<Paper
  key={food.id}
  sx={{
    p: 1.5,
    mb: 1,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    "&:hover": {
      boxShadow: 2,
    },
  }}
>
  {/* HEADER */}
  <Box sx={{ mb: 1 }}>
   <Typography
  sx={{
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "text.primary",
  }}
>
  {food.name}
</Typography>
  </Box>

  {/* INFO CHIPS */}
  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
    {food.food_group && (
      <Chip size="small" label={food.food_group} sx={{
    backgroundColor: "primary.main",
    color: "white",
    fontWeight: 500,
  }}/>
    )}

    {food.category && (
      <Chip size="small" color="info" label={food.category} />
    )}
  </Box>

  {/* NUTRICIÓN (SI EXISTE) */}
  {food.food_nutrition?.[0] && (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 0.5,
        mb: 1,
        textAlign: "center",
      }}
    >
      <Box>
        <Typography variant="caption" color="text.secondary">
          kcal
        </Typography>
        <Typography >
          {food.food_nutrition[0].kcal}
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary">
          P
        </Typography>
        <Typography >
          {food.food_nutrition[0].protein}g
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary">
          C
        </Typography>
        <Typography >
          {food.food_nutrition[0].carbs}g
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary">
          G
        </Typography>
        <Typography >
          {food.food_nutrition[0].fat}g
        </Typography>
      </Box>
    </Box>
  )}

  {/* BOTÓN */}
  <Button
    fullWidth
    variant="outlined"
    size="small"
    onClick={() => {
      setPendingFood(food);
      setPendingMeal(selectedMeal);
      setPendingGrams(100);
      setModalOpen(true);
    }}
  >
    Añadir
  </Button>
</Paper>
          ))}
        </Box>
      </Box>

      {/* CENTER */}
      <Box sx={{ width: { xs: "100%", md: "51%" } }}>
        <Typography variant="h6">Semana</Typography>

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          {plan.map((_, i) => (
            <Paper
              key={i}
              onClick={() => setActiveDay(i)}
              sx={{
                p: 1,
                cursor: "pointer",
                background: i === activeDay ? "#1976d2" : "#fff",
                color: i === activeDay ? "#fff" : "#000",
              }}
            >
              {DAYS[i]}
            </Paper>
          ))}
        </Box>

        {plan[activeDay].meals.map((meal) => {
          const mealTotals = meal.items.reduce(
            (acc, item) => {
              const n = getNutrition(item.food);
              if (!n) return acc;

              const factor = item.grams / 100;

              acc.kcal += n.kcal * factor;
              acc.p += n.protein * factor;
              acc.c += n.carbs * factor;
              acc.f += n.fat * factor;

              return acc;
            },
            { kcal: 0, p: 0, c: 0, f: 0 }
          );

          return (
            <Paper key={meal.meal_type} sx={{ p: 2, mb: 2 }}>
             <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 2,
    pb: 1,
    borderBottom: "1px solid",
    borderColor: "divider",
  }}
>
  <Box sx={{
    borderLeft: `6px solid ${mealColors[meal.meal_type]}`,
    pl: 2,
  }}>
    <Typography
      variant="h6"
     
    >
      {mealLabels[meal.meal_type]}
    </Typography>

    <Typography
      variant="caption"
      color="text.secondary"
    >
      {meal.items.length} alimentos
    </Typography>
  </Box>

  <Chip
    color="primary"
    label={`${mealTotals.kcal.toFixed(0)} kcal`}
  />
</Box>

              {meal.items.map((item) => {
                const n = getNutrition(item.food);
                const factor = item.grams / 100;

                const kcal = n ? n.kcal * factor : 0;
                const protein = n ? n.protein * factor : 0;
                const carbs = n ? n.carbs * factor : 0;
                const fat = n ? n.fat * factor : 0;

                return (
<Paper
  key={item.id}
  elevation={1}
  sx={{
    p: 1.5,
    mb: 1,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    transition: "0.2s",
    "&:hover": {
      boxShadow: 3,
    },
  }}
>
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 1,
    }}
  >
    <Box>
      <Typography >
        {item.food.name}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        {item.grams} g
      </Typography>
    </Box>

    <Button
      size="small"
      color="error"
      startIcon={<DeleteIcon />}
      onClick={() =>
        removeItem(meal.meal_type, item.id)
      }
    >
      Eliminar
    </Button>
  </Box>

  <Box
    sx={{
      display: "flex",
      gap: 1,
      flexWrap: "wrap",
    }}
  >
    <Chip
      icon={<LocalFireDepartmentIcon />}
      label={`${kcal.toFixed(0)} kcal`}
      color="warning"
      size="small"
    />

    <Chip
      label={`🥩 ${protein.toFixed(1)}g`}
      color="success"
      size="small"
    />

    <Chip
      label={`🍞 ${carbs.toFixed(1)}g`}
      color="info"
      size="small"
    />

    <Chip
      label={`🥑 ${fat.toFixed(1)}g`}
      color="secondary"
      size="small"
    />
  </Box>
</Paper>
                );
              })}
            </Paper>
          );
        })}
        
      </Box>

      {/* RIGHT */}
      <Box
        sx={{
            width: { xs: "100%", md: "25%" },
            display: "flex",
            flexDirection: { xs: "column", md: "column" },
            gap: 2,
        }}
        >
<Button
  variant="contained"
  color="success"
  disabled={saving}
  onClick={handleSavePlan}
>
  {saving ? "Guardando..." : "Guardar plan"}
</Button>

<Button
  variant="outlined"
  color="primary"
  onClick={() => setShoppingOpen(true)}
>
  🛒 Lista de la compra
</Button>
       <Paper
            elevation={2}
            sx={{
                p: 2,
                borderRadius: 3,
                // background: "linear-gradient(135deg, #1e1e1e, #2a2a2a)",
                color: "black",
            }}
            >
            <Typography variant="h6" sx={{ mb: 2 }}>
                📊 Resumen
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography>Kcal: {totals.kcal.toFixed(0)}</Typography>
                <Typography>Prote: {totals.p.toFixed(1)}g</Typography>
                <Typography>Carbs: {totals.c.toFixed(1)}g</Typography>
                <Typography>Grasa: {totals.f.toFixed(1)}g</Typography>
            </Box>
            </Paper>

       <Paper
            elevation={1}
            sx={{ p: 2, borderRadius: 3 }}
            >
            <Typography variant="h6" sx={{ mb: 2 }}>
                🎯 Objetivo
            </Typography>

            {[
                {
                label: "Kcal",
                value: totals.kcal,
                target: target?.target_kcal,
                },
                {
                label: "Prote",
                value: totals.p,
                target: target?.protein_g,
                },
                {
                label: "Carbs",
                value: totals.c,
                target: target?.carbs_g,
                },
                {
                label: "Grasa",
                value: totals.f,
                target: target?.fat_g,
                },
            ].map((item) => {
                const percent = item.target
                ? Math.min((item.value / item.target) * 100, 100)
                : 0;

                return (
                <Box key={item.label} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">
                        {item.label}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                        {item.value.toFixed(0)} / {item.target ?? "--"}
                    </Typography>
                    </Box>

                    <Box
                    sx={{
                        height: 6,
                        borderRadius: 5,
                        background: "#eee",
                        mt: 0.5,
                    }}
                    >
                    <Box
                        sx={{
                        width: `${percent}%`,
                        height: "100%",
                        borderRadius: 5,
                        background:
                            percent > 100 ? "#f44336" : "#4caf50",
                        transition: "0.3s",
                        }}
                    />
                    </Box>
                </Box>
                );
            })}
            </Paper>

        <Paper
            elevation={1}
            sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "#fafafa",
            }}
            >
            <Typography variant="h6" sx={{ mb: 2 }}>
                ⚖️ Balance
            </Typography>

            {[
                {
                label: "Kcal",
                value: diff.kcal,
                },
                {
                label: "Prote",
                value: diff.p,
                },
                {
                label: "Carbs",
                value: diff.c,
                },
                {
                label: "Grasa",
                value: diff.f,
                },
            ].map((item) => (
                <Box
                key={item.label}
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                }}
                >
                <Typography variant="body2">
                    {item.label}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                    fontWeight: 600,
                    color:
                        item.value > 0
                        ? "error.main"
                        : "success.main",
                    }}
                >
                    {item.value > 0 ? "+" : ""}
                    {item.value.toFixed(2)}
                </Typography>
                </Box>
            ))}
            </Paper>
      </Box>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
  <DialogTitle>Añadir alimento</DialogTitle>

  <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
    
    <Typography>
      {pendingFood?.name}
    </Typography>

    <TextField
      select
      label="Comida"
      value={pendingMeal}
      onChange={(e) => setPendingMeal(e.target.value)}
    >
      {MEALS.map((m) => (
        <MenuItem key={m} value={m}>
          {m}
        </MenuItem>
      ))}
    </TextField>

    <TextField
      type="number"
      label="Gramos"
      value={pendingGrams}
      onChange={(e) => setPendingGrams(Number(e.target.value))}
    />

  </DialogContent>

  <DialogActions>
    <Button onClick={() => setModalOpen(false)}>
      Cancelar
    </Button>

    <Button variant="contained" onClick={addFood}>
      Añadir
    </Button>
  </DialogActions>
</Dialog>
<Dialog
  open={shoppingOpen}
  onClose={() => setShoppingOpen(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>🛒 Lista de la compra</DialogTitle>

  <DialogContent>
      <div ref={pdfRef}>
{shoppingListGrouped.length === 0 ? (
  <Typography>No hay alimentos en el plan</Typography>
) : (
  shoppingListGrouped.map((group) => (
    <Paper
      key={group.group}
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        background: "#fafafa",
      }}
    >
      {/* HEADER GRUPO */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {group.group}
        </Typography>

        <Chip
          size="small"
          label={`${group.items.length} productos`}
          sx={{
            fontWeight: 600,
          }}
        />
      </Box>

      {/* ITEMS */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {group.items.map((item) => (
          <Box
            key={item.food.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 1.2,
              borderRadius: 2,
              background: "white",
              border: "1px solid #eee",
              transition: "0.2s",
              "&:hover": {
                boxShadow: 1,
                transform: "translateY(-1px)",
              },
            }}
          >
            {/* LEFT */}
            <Box>
              <Typography sx={{ fontWeight: 600 }}>
                {item.food.name}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {item.food.category ?? "Sin categoría"}
              </Typography>
            </Box>

            {/* RIGHT */}
            <Chip
              label={`${item.grams.toFixed(0)} g`}
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  ))
)}
</div>
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setShoppingOpen(false)}>
      Cerrar
    </Button>
    <Button onClick={exportToPDF} variant="contained">
        📄 Exportar PDF
        </Button>
  </DialogActions>
</Dialog>
<Snackbar
  open={snackbar.open}
  autoHideDuration={5000}
  onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
    anchorOrigin={{ vertical: "top", horizontal: "center" }}
>
  <Alert
    severity={snackbar.severity}
    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
    variant="filled"
     sx={{
      fontSize: "1rem",
      py: 1.5,
      px: 2,
      minWidth: 300,
    }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>
    </Box>
  );
}