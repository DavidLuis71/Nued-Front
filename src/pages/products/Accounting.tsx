import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
  Dialog,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { apiFetch } from "../../api/api";

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  expense_date: string;
};

type Summary = {
  income: {
    products: number;
    appointments: number;
    total: number;
  };
  expenses: number;
  balance: number;
};

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function Accounting() {
  const now = new Date();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [open, setOpen] = useState(false);

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    expense_date: `${year}-${String(month).padStart(2, "0")}-01`,
  });
  const balance = summary?.balance ?? 0;


  useEffect(() => {
  setForm((prev) => ({
    ...prev,
    expense_date: `${year}-${String(month).padStart(2, "0")}-01`,
  }));
}, [month, year]);

  /* =====================
     LOAD DATA (MONTH FILTER)
  ===================== */
  useEffect(() => {
    const load = async () => {
      const [summaryRes, expRes] = await Promise.all([
        apiFetch(`/expenses/finance/summary?year=${year}&month=${month}`),
        apiFetch(`/expenses?year=${year}&month=${month}`),
      ]);

      setSummary(await summaryRes.json());
      setExpenses(await expRes.json());
    };

    load();
  }, [month, year]);

  /* =====================
     CREATE EXPENSE
  ===================== */
  const createExpense = async () => {
    const res = await apiFetch("/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        expense_date: form.expense_date,
      }),
    });

    await res.json();

    setOpen(false);
   setForm({
      title: "",
      amount: "",
      category: "",
      expense_date: `${year}-${String(month).padStart(2, "0")}-01`,
    });

    // reload
    const [summaryRes, expRes] = await Promise.all([
      apiFetch(`/expenses/finance/summary?year=${year}&month=${month}`),
      apiFetch(`/expenses?year=${year}&month=${month}`),
    ]);

    setSummary(await summaryRes.json());
    setExpenses(await expRes.json());
  };

  const chartData = [
  {
    name: "Productos",
    value: summary?.income.products || 0,
  },
  {
    name: "Citas",
    value: summary?.income.appointments || 0,
  },
  {
    name: "Gastos",
    value: summary?.expenses || 0,
  },
];

const COLORS = ["#4caf50", "#2196f3", "#f44336"];
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>

      {/* HEADER */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        💰 Contabilidad
      </Typography>

      {/* FILTER */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          size="small"
        >
          {months.map((m, i) => (
            <MenuItem key={i} value={i + 1}>
              {m}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          size="small"
        />
      </Stack>

      {/* BALANCE */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          textAlign: "center",
          borderRadius: 3,
         background: balance >= 0 ? "#e8f5e9" : "#ffebee",
        }}
      >
        <Typography>Balance {months[month - 1]} {year}</Typography>

        <Typography variant="h4" >
          {(summary?.balance ?? 0).toFixed(2)}€
        </Typography>
      </Paper>

      {/* GRID */}
{/* GRID */}
<Box
  sx={{
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      md: "1fr 1fr",
    },
    gap: 2,
  }}
>
  {/* GRÁFICO */}
  <Paper sx={{ p: 3, borderRadius: 3 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>
      📊 Distribución financiera
    </Typography>

    <Box sx={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
          >
            {chartData.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) =>
              `${Number(value ?? 0).toFixed(2)}€`
            }
          />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  </Paper>

  {/* RESUMEN */}
  <Paper sx={{ p: 3, borderRadius: 3 }}>
    <Typography variant="h6">
      💼 Resumen económico
    </Typography>

    <Stack spacing={2} sx={{ mt: 3 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
        }}
      >
        <Typography color="success.main">
          Productos
        </Typography>

        <Typography variant="h5">
          {(summary?.income.products ?? 0).toFixed(2)}€
        </Typography>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
        }}
      >
        <Typography color="primary.main">
          Citas
        </Typography>

        <Typography variant="h5">
          {(summary?.income.appointments ?? 0).toFixed(2)}€
        </Typography>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
        }}
      >
        <Typography color="error.main">
          Gastos
        </Typography>

        <Typography variant="h5">
          {(summary?.expenses ?? 0).toFixed(2)}€
        </Typography>
      </Paper>

      <Button
        fullWidth
        variant="contained"
        onClick={() => setOpen(true)}
      >
        + Añadir gasto
      </Button>
    </Stack>
  </Paper>
</Box>

{/* LISTA DE GASTOS */}
<Paper
  sx={{
    p: 3,
    mt: 3,
    borderRadius: 3,
  }}
>
  <Typography variant="h6" sx={{ mb: 2 }}>
    🧾 Gastos del periodo
  </Typography>

  <Stack spacing={1}>
    {expenses.map((e) => (
      <Paper
        key={e.id}
        sx={{
          p: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 2,
        }}
      >
        <Box>
          <Typography>{e.title}</Typography>

          <Chip
            label={e.category}
            size="small"
          />
        </Box>

        <Typography color="error">
          -{Number(e.amount).toFixed(2)}€
        </Typography>
      </Paper>
    ))}
  </Stack>
</Paper>
      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Nuevo gasto</Typography>

          <TextField
            fullWidth
            label="Título"
            sx={{ mt: 2 }}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <TextField
            fullWidth
            label="Cantidad"
            type="number"
            sx={{ mt: 2 }}
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <TextField
            fullWidth
            label="Categoría"
            sx={{ mt: 2 }}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <TextField
              fullWidth
              type="date"
              label="Fecha"
              // InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
              value={form.expense_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  expense_date: e.target.value,
                })
              }
            />

          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={createExpense}>
            Guardar
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}