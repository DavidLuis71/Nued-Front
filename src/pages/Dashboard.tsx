import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api";
import AppointmentCard, {
  type AppointmentStatus,
} from "../helpers/AppointmentCard";
import WhatsappDialog from "../helpers/WhatsappDialog";

type Appointment = {
  id: string;
  date: string;
  status: AppointmentStatus;
  duration_minutes: number;
  notification_sent: boolean;
  notification_sent_at: string | null;

  patients: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [openWhatsapp, setOpenWhatsapp] = useState(false);

  // ❌ cancel dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<
    string | null
  >(null);

  // ✨ animation highlight
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await apiFetch("/appointments");
      const data = await res.json();

      const now = new Date();

      const upcoming = data
        .filter((a: Appointment) => new Date(a.date) >= now)
        .sort(
          (a: Appointment, b: Appointment) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        .slice(0, 10);

      setAppointments(upcoming);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 update status
  const updateAppointmentStatus = async (
    id: string,
    status: AppointmentStatus
  ) => {
    try {
      await apiFetch(`/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      // ✨ animación
      setHighlightedId(id);

      await fetchAppointments();

      setTimeout(() => setHighlightedId(null), 800);
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ open confirm dialog
  const handleCancelClick = (id: string) => {
    setAppointmentToCancel(id);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel) return;

    await updateAppointmentStatus(appointmentToCancel, "cancelled");

    setCancelDialogOpen(false);
    setAppointmentToCancel(null);
  };

return (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      px: 2,
    }}
  >
    <Box
      sx={{
        width: "100%",
        maxWidth: 900,
      }}
    >
      {/* HEADER */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mb: 2,
        }}
      >
        Próximas citas
      </Typography>

      {/* LOADING */}
      {loading && <CircularProgress />}

      {/* EMPTY */}
      {!loading && appointments.length === 0 && (
        <Typography>No hay próximas citas.</Typography>
      )}

      {/* LISTA */}
      <Box>
        <Stack spacing={1.5}>
          {appointments.map((appointment) => (
            <Paper
              key={appointment.id}
              sx={{
                p: 0,
                borderRadius: 3,
                transition: "0.2s",
                transform:
                  highlightedId === appointment.id
                    ? "scale(1.01)"
                    : "scale(1)",
                boxShadow:
                  highlightedId === appointment.id
                    ? "0 0 0 2px #1976d2"
                    : "0 2px 10px rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <AppointmentCard
                appointment={appointment}
                onWhatsapp={() => {
                  setSelectedAppointment(appointment);
                  setOpenWhatsapp(true);
                }}
                onOpen={() => navigate("/appointments")}
                onConfirm={() =>
                  updateAppointmentStatus(appointment.id, "confirmed")
                }
                onCancel={() => handleCancelClick(appointment.id)}
                onComplete={() =>
                  updateAppointmentStatus(appointment.id, "completed")
                }
              />
            </Paper>
          ))}
        </Stack>
      </Box>

      {/* WhatsApp */}
      <WhatsappDialog
        open={openWhatsapp}
        appointment={selectedAppointment}
        onClose={() => setOpenWhatsapp(false)}
      />

      {/* CANCEL DIALOG */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>¿Cancelar esta cita?</DialogTitle>

        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            No
          </Button>

          <Button color="error" onClick={confirmCancel}>
            Sí, cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  </Box>
);
}