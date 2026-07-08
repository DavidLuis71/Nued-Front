import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type AppointmentCardProps = {
  appointment: {
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

  onWhatsapp?: () => void;
  onOpen?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
};

const statusLabel: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

export default function AppointmentCard({
  appointment,
  onWhatsapp,
  onOpen,
  onConfirm,
  onCancel,
  onComplete,
}: AppointmentCardProps) {
  const appointmentDate = new Date(appointment.date);

  const getRemainingTime = () => {
    const now = new Date();
    const diff = appointmentDate.getTime() - now.getTime();

    const minutes = Math.floor(diff / 60000);

    if (minutes <= 0) return "Ahora";

    if (minutes < 60) return `En ${minutes} min`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `En ${hours} h`;

    const days = Math.floor(hours / 24);

    return `En ${days} día${days > 1 ? "s" : ""}`;
  };

  const getStatusColor = () => {
    switch (appointment.status) {
      case "confirmed":
        return "success";
      case "completed":
        return "primary";
      case "cancelled":
        return "error";
      default:
        return "warning";
    }
  };

return (
  <Card sx={{ p: 1 }}>
    <CardContent sx={{ p: 1 }}>

      <Stack spacing={1.5}>

        {/* HEADER: NOMBRE */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {appointment.patients.first_name} {appointment.patients.last_name}
        </Typography>

        {/* FECHA MÁS DESTACADA */}
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            backgroundColor: "rgba(25, 118, 210, 0.06)",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
            }}
          >
            📅{" "}
            {appointmentDate.toLocaleDateString("es-ES")} ·{" "}
            {appointmentDate.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mt: 0.5,
            }}
          >
            ⏳ {getRemainingTime()}
          </Typography>
        </Box>

        {/* CHIPS */}
        <Stack direction="row" spacing={1}>
          <Chip
            size="small"
            sx={{ fontSize: 11, height: 22 }}
            color={getStatusColor()}
            label={statusLabel[appointment.status]}
          />

          <Chip
            size="small"
            sx={{ fontSize: 11, height: 22 }}
            variant="outlined"
            color={appointment.notification_sent ? "success" : "warning"}
            label={appointment.notification_sent ? "Avisada" : "Pendiente"}
          />
        </Stack>

        {/* BOTONES ABAJO */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexWrap: "wrap",
            pt: 1,
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {appointment.status === "pending" && (
            <>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={onConfirm}
              >
                Confirmar
              </Button>

              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            </>
          )}

          {appointment.status === "confirmed" && (
            <>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={onComplete}
              >
                Completar
              </Button>

              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            </>
          )}

          {appointment.status !== "cancelled" && (
            <Button
            size="small"
            variant="contained"
            startIcon={<WhatsAppIcon />}
            onClick={onWhatsapp}
            sx={{
                backgroundColor: "#25D366",
                "&:hover": {
                backgroundColor: "#1ebe5d",
                },
            }}
            >
            WhatsApp
            </Button>
          )}

          <Button
            size="small"
            variant="outlined"
            onClick={onOpen}
          >
            Abrir
          </Button>
        </Stack>

      </Stack>

    </CardContent>
  </Card>
);
}