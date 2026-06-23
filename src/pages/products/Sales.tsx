import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Divider,
  Dialog,
  Chip,
  MenuItem,
} from "@mui/material";
import { apiFetch } from "../../api/api";

type Sale = {
  id: string;
  sale_date: string;
  payment_method: string;
  total_net: number;
  total_vat: number;
  total_amount: number;

  patients?: {
    first_name: string;
    last_name: string;
  } | null;
};

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [saleDetail, setSaleDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 📅 MES SELECCIONADO (DEFAULT: ACTUAL)
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return {
      month: now.getMonth(),
      year: now.getFullYear(),
    };
  });

  useEffect(() => {
    const fetchSales = async () => {
      const res = await apiFetch("/sales");
      const data = await res.json();
      setSales(data);
    };

    fetchSales();
  }, []);

  // 🔍 DETALLE
  const openSale = async (sale: Sale) => {
    setLoadingDetail(true);
    try {
      const res = await apiFetch(`/sales/${sale.id}`);
      const data = await res.json();
      setSaleDetail(data);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 📦 VENTAS DEL MES SELECCIONADO
  const monthSales = useMemo(() => {
    return sales.filter((s) => {
      const d = new Date(s.sale_date);
      return (
        d.getMonth() === selectedDate.month &&
        d.getFullYear() === selectedDate.year
      );
    });
  }, [sales, selectedDate]);

  // 🔍 FILTRO BUSCADOR (dentro del mes)
  const filteredSales = useMemo(() => {
    return monthSales.filter((s) => {
      const patientName = s.patients
        ? `${s.patients.first_name} ${s.patients.last_name ?? ""}`
        : "sin paciente";

      return (
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        patientName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [monthSales, search]);

  // 📊 KPIs DEL MES
// 📊 KPIs DEL MES
const kpis = useMemo(() => {
  const total = monthSales.reduce(
    (acc, s) => acc + (s.total_amount || 0),
    0
  );

  const totalVat = monthSales.reduce(
    (acc, s) => acc + (s.total_vat || 0),
    0
  );

  const avgTicket = monthSales.length
    ? total / monthSales.length
    : 0;

  const maxSale =
    monthSales.length > 0
      ? Math.max(...monthSales.map((s) => s.total_amount || 0))
      : 0;

  const cashTotal = monthSales
    .filter((s) => s.payment_method === "cash")
    .reduce((acc, s) => acc + (s.total_amount || 0), 0);

  const cardTotal = monthSales
    .filter((s) => s.payment_method === "card")
    .reduce((acc, s) => acc + (s.total_amount || 0), 0);

  const transferTotal = monthSales
    .filter((s) => s.payment_method === "transfer")
    .reduce((acc, s) => acc + (s.total_amount || 0), 0);

  return {
    total,
    avgTicket,
    count: monthSales.length,
    totalVat,
    maxSale,
    cashTotal,
    cardTotal,
    transferTotal,
  };
}, [monthSales]);

  const paymentColor = (method: string) => {
    switch (method) {
      case "cash":
        return "success";
      case "card":
        return "primary";
      case "transfer":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 2 }}>
      {/* HEADER */}
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
        🧾 Gestión de Ventas
      </Typography>

      {/* SELECTOR DE MES */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
       <TextField
  select
  label="Mes"
  value={selectedDate.month}
  onChange={(e) =>
    setSelectedDate((prev) => ({
      ...prev,
      month: Number(e.target.value),
    }))
  }
  sx={{ width: 160 }}
>
  {[
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ].map((m, i) => (
    <MenuItem key={i} value={i}>
      {m}
    </MenuItem>
  ))}
</TextField>

        <TextField
          label="Año"
          type="number"
          value={selectedDate.year}
          onChange={(e) =>
            setSelectedDate((prev) => ({
              ...prev,
              year: Number(e.target.value),
            }))
          }
          sx={{ width: 120 }}
        />
      </Stack>

      {/* KPIs */}
{/* KPIs */}
<Stack spacing={2} sx={{ mb: 3 }}>
  <Stack direction="row" spacing={2}>
    <Paper sx={{ p: 2, flex: 1 }}>
      <Typography variant="body2">
        Facturación
      </Typography>
      <Typography variant="h6">
        {kpis.total.toFixed(2)}€
      </Typography>
    </Paper>

    <Paper sx={{ p: 2, flex: 1 }}>
      <Typography variant="body2">
        Ventas
      </Typography>
      <Typography variant="h6">
        {kpis.count}
      </Typography>
    </Paper>

    {/* <Paper sx={{ p: 2, flex: 1 }}>
      <Typography variant="body2">
        Ticket medio
      </Typography>
      <Typography variant="h6">
        {kpis.avgTicket.toFixed(2)}€
      </Typography>
    </Paper> */}

    <Paper sx={{ p: 2, flex: 1 }}>
      <Typography variant="body2">
        IVA generado
      </Typography>
      <Typography variant="h6">
        {kpis.totalVat.toFixed(2)}€
      </Typography>
    </Paper>
  </Stack>

  <Stack direction="row" spacing={2}>
    {/* <Paper sx={{ p: 2, flex: 1 }}>
      <Typography variant="body2">
        Mayor venta
      </Typography>
      <Typography variant="h6">
        {kpis.maxSale.toFixed(2)}€
      </Typography>
    </Paper> */}

    <Paper sx={{ p: 2, flex: 1 }}>
      <Typography variant="body2">
        Efectivo
      </Typography>
      <Typography variant="h6">
        {kpis.cashTotal.toFixed(2)}€
      </Typography>
    </Paper>

    <Paper sx={{ p: 2, flex: 1 }}>
      <Typography variant="body2">
        Tarjeta
      </Typography>
      <Typography variant="h6">
        {kpis.cardTotal.toFixed(2)}€
      </Typography>
    </Paper>

    <Paper sx={{ p: 2, flex: 1 }}>
      <Typography variant="body2">
        Transferencia
      </Typography>
      <Typography variant="h6">
        {kpis.transferTotal.toFixed(2)}€
      </Typography>
    </Paper>
  </Stack>
</Stack>

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Buscar por paciente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* LIST */}
      <Stack spacing={2}>
        {filteredSales.map((sale) => (
          <Paper
            key={sale.id}
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              "&:hover": { boxShadow: 4 },
            }}
          >
            {/* LEFT */}
            <Box>
              <Typography >
                Venta #{sale.id.slice(0, 8)}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {new Date(sale.sale_date).toLocaleString()}
              </Typography>

              <Typography variant="body2">
                {sale.patients
                  ? `${sale.patients.first_name} ${sale.patients.last_name ?? ""}`
                  : "Sin paciente"}
              </Typography>

              <Chip
                label={sale.payment_method}
                size="small"
                color={paymentColor(sale.payment_method) as any}
                sx={{ mt: 1 }}
              />
            </Box>

            {/* RIGHT */}
          <Box sx={{ textAlign: "right" }}>
              <Typography >
                {Number(sale.total_amount).toFixed(2)}€
              </Typography>

              <Button
                size="small"
                variant="contained"
                sx={{ mt: 1, borderRadius: 2 }}
                onClick={() => openSale(sale)}
              >
                Ver detalle
              </Button>
            </Box>
          </Paper>
        ))}
      </Stack>

      {/* DETAIL */}
      <Dialog
        open={!!saleDetail}
        onClose={() => setSaleDetail(null)}
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography >
            🧾 Venta #{saleDetail?.id?.slice(0, 8)}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {saleDetail &&
              new Date(saleDetail.sale_date).toLocaleString()}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {loadingDetail && (
            <Typography>Cargando detalle...</Typography>
          )}

          <Stack spacing={1}>
            {saleDetail?.sale_items?.map((item: any) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  bgcolor: "#f5f5f5",
                  borderRadius: 1,
                }}
              >
                <Typography>
                  {item.products?.name} × {item.quantity}
                </Typography>

                <Typography >
                  {Number(item.line_total).toFixed(2)}€
                </Typography>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography>
              Neto: {Number(saleDetail?.total_net || 0).toFixed(2)}€
            </Typography>
            <Typography>
              IVA: {Number(saleDetail?.total_vat || 0).toFixed(2)}€
            </Typography>
            <Typography >
              Total: {Number(saleDetail?.total_amount || 0).toFixed(2)}€
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => setSaleDetail(null)}
          >
            Cerrar
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}