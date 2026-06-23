import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import { apiFetch } from "../../api/api";


type Product = {
  id: string;
  name: string;
  price: number;
  vat_percent: number;
  stock: number;
minimum_stock: number;
};

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
};

type CartItem = Product & {
  quantity: number;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const [selectedPatient, setSelectedPatient] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [loadingSale, setLoadingSale] = useState(false);

  const [ticket, setTicket] = useState<any | null>(null);
  const [snackbar, setSnackbar] = useState<{
  open: boolean;
  message: string;
  severity: "success" | "error";
}>({
  open: false,
  message: "",
  severity: "success",
});

const isLowStock = (p: Product) => {
  return p.stock <= p.minimum_stock;
};

const showSnackbar = (message: string, severity: "success" | "error") => {
  setSnackbar({
    open: true,
    message,
    severity,
  });
};

const handleCloseTicket = () => {
  setTicket(null);
};
  /* =========================
     FETCH PRODUCTS
  ========================= */
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await apiFetch("/products");
      const data = await res.json();
      setProducts(data);
    };

    fetchProducts();
  }, []);

  /* =========================
     FETCH PATIENTS
  ========================= */
  useEffect(() => {
    const fetchPatients = async () => {
      const res = await apiFetch("/patients");
      const data = await res.json();
      setPatients(data);
    };

    fetchPatients();
  }, []);

  /* =========================
     FILTER PRODUCTS
  ========================= */
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  /* =========================
     CART ACTIONS
  ========================= */
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);

      if (exists) {
        return prev.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((p) => p.id !== id));
      return;
    }

    setCart((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: qty } : p
      )
    );
  };

  /* =========================
     TOTAL CALC
  ========================= */
  const total = useMemo(() => {
    return cart.reduce((acc, item) => {
      const net = item.price * item.quantity;
      const vat = net * (item.vat_percent / 100);
      return acc + net + vat;
    }, 0);
  }, [cart]);

  /* =========================
     CONFIRM SALE
  ========================= */
const confirmSale = async () => {
  if (cart.length === 0) return;

  setLoadingSale(true);

  try {
    const res = await apiFetch("/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patient_id: selectedPatient || null,
        payment_method: paymentMethod,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      }),
    });

    const data = await res.json();
   

    if (!res.ok) {
       showSnackbar(data.error || "Error creando venta", "error");
      return;
    }
 setTicket({
        ...data,
        items: cart,
        total,
        paymentMethod,
        });
    setCart([]);
    setSelectedPatient("");

    // 🔥 feedback visual inmediato
   showSnackbar("Venta realizada correctamente", "success");
  } catch (err) {
     showSnackbar("Error de conexión", "error");
  } finally {
    setLoadingSale(false);
  }
};

  /* =========================
     UI
  ========================= */
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
      {/* =========================
          PRODUCTS
      ========================= */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6">📦 Productos</Typography>

        <TextField
          fullWidth
          sx={{ mt: 2, mb: 2 }}
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Stack spacing={1}>
          {filteredProducts.map((p) => (
            <Paper
              key={p.id}
               sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: isLowStock(p) ? "1px solid #f44336" : "1px solid transparent",
                    backgroundColor: isLowStock(p) ? "#fff5f5" : "transparent",
                }}
            >
              <Box>
                <Typography >{p.name}</Typography>
                <Typography variant="body2">
                  {p.price.toFixed(2)}€ (+ IVA {p.vat_percent}%)
                </Typography>
                <Typography variant="caption">
                  Stock: {p.stock}
                </Typography>
                {isLowStock(p) && (
                    <Typography
                        variant="caption"
                        sx={{
                        display: "block",
                        color: "#d32f2f",
                        fontWeight: 600,
                        mt: 0.5,
                        }}
                    >
                        ⚠️ Stock bajo (mín: {p.minimum_stock})
                    </Typography>
                    )}
              </Box>

              <Button
                variant="contained"
                size="small"
                disabled={p.stock === 0}
                color={isLowStock(p) ? "error" : "primary"}
                onClick={() => addToCart(p)}
                >
                {p.stock === 0 ? "Sin stock" : "Añadir"}
                </Button>
            </Paper>
          ))}
        </Stack>
      </Paper>

      {/* =========================
          CART
      ========================= */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6">🛒 Carrito</Typography>

        {/* paciente */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Paciente (opcional)</InputLabel>
          <Select
            value={selectedPatient}
            label="Paciente (opcional)"
            onChange={(e) => setSelectedPatient(e.target.value)}
          >
            <MenuItem value="">Sin paciente</MenuItem>
            {patients.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.first_name} {p.last_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* pago */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Método de pago</InputLabel>
          <Select
            value={paymentMethod}
            label="Método de pago"
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <MenuItem value="cash">Efectivo</MenuItem>
            <MenuItem value="card">Tarjeta</MenuItem>
            <MenuItem value="transfer">Transferencia</MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* items */}
        <Stack spacing={1}>
          {cart.map((item) => (
            <Paper
              key={item.id}
              sx={{
                p: 1.5,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography >
                  {item.name}
                </Typography>
                <Typography variant="body2">
                  {item.price.toFixed(2)}€
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  size="small"
                  onClick={() =>
                    updateQty(item.id, item.quantity - 1)
                  }
                >
                  -
                </Button>

                <Typography>{item.quantity}</Typography>

                <Button
                  size="small"
                  onClick={() =>
                    updateQty(item.id, item.quantity + 1)
                  }
                >
                  +
                </Button>
              </Box>
            </Paper>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">
          Total: {total.toFixed(2)}€
        </Typography>

       <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
        disabled={cart.length === 0 || loadingSale}
        onClick={confirmSale}
        >
        {loadingSale ? "Procesando..." : "Confirmar venta"}
        </Button>
      </Paper>

      <Snackbar
  open={snackbar.open}
  autoHideDuration={3000}
  onClose={() =>
    setSnackbar((prev) => ({ ...prev, open: false }))
  }
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
>
  <Alert
    severity={snackbar.severity}
    variant="filled"
    onClose={() =>
      setSnackbar((prev) => ({ ...prev, open: false }))
    }
  >
    {snackbar.message}
  </Alert>
</Snackbar>
<Dialog
  open={!!ticket}
  onClose={() => setTicket(null)}
  fullWidth
>
  <Box sx={{ p: 3 }}>
    <Typography variant="h6">
      🧾 Ticket de venta
    </Typography>
    <Typography variant="body2" color="text.secondary">
        ID: {ticket?.id || "—"}
        </Typography>

    <Divider sx={{ my: 2 }} />

    {ticket?.items?.map((item: any) => (
      <Box
        key={item.id}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography>
          {item.name} x{item.quantity}
        </Typography>

        <Typography>
          {(item.price * item.quantity).toFixed(2)}€
        </Typography>
      </Box>
    ))}

    <Divider sx={{ my: 2 }} />

    <Typography variant="h6">
      Total: {ticket?.total?.toFixed(2)}€
    </Typography>

    <Typography variant="body2" sx={{ mt: 1 }}>
      Pago: {ticket?.paymentMethod}
    </Typography>

        <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
         onClick={handleCloseTicket}
        >
        Cerrar
        </Button>
  </Box>
</Dialog>
    </Box>
  );
}