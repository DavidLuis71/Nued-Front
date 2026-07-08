import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;

  appointment: {
    date: string;

    patients: {
      first_name: string;
      last_name: string;
      phone: string;
    };
  } | null;

  onSent?: () => void;
};

export default function WhatsappDialog({
  open,
  onClose,
  appointment,
  onSent,
}: Props) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!appointment) return;

    const date = new Date(appointment.date);

    const formattedDate = date.toLocaleDateString("es-ES");

    const formattedTime = date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessage(
      `Hola ${appointment.patients.first_name} 😊.

Te recordamos que tienes una cita el ${formattedDate} a las ${formattedTime}.

Si necesitas cambiarla, avísanos.

¡Gracias!`
    );
  }, [appointment]);

  const openWhatsapp = () => {
    if (!appointment) return;

    let phone = appointment.patients.phone.replace(/\D/g, "");

    if (!phone.startsWith("34")) {
        phone = `34${phone}`;
        }

    window.open(
      `https://wa.me/34${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    onSent?.();

    onClose();
  };

  if (!appointment) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Enviar recordatorio
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} >
          <Typography>

            <strong>Paciente:</strong>{" "}
            {appointment.patients.first_name}{" "}
            {appointment.patients.last_name}

          </Typography>

          <Typography>

            <strong>Teléfono:</strong>{" "}
            {appointment.patients.phone}

          </Typography>

          <TextField
            label="Mensaje"
            multiline
            minRows={8}
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={openWhatsapp}
        >
          Abrir WhatsApp
        </Button>
      </DialogActions>
    </Dialog>
  );
}