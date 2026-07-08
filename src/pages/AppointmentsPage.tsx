import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useRef } from "react";
import { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import type {  EventClickArg } from "@fullcalendar/core";
import { useTheme } from "@mui/material/styles";
import { apiFetch } from "../api/api";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
} from "@mui/material";

import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: any;
};

export default function Appointments() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
const [openDialog, setOpenDialog] = useState(false);
const theme = useTheme();
const goToDate = (date: string) => {
  const api = calendarRef.current?.getApi();
  api?.gotoDate(date);
};
  const fetchAppointments = async () => {
    try {
      const res = await apiFetch("/appointments");
      const data = await res.json();

     const mapped = data.map((a: any) => {
  const end = new Date(a.date);

  end.setMinutes(
    end.getMinutes() + (a.duration_minutes ?? 30)
  );

  return {
    id: a.id,

    title: `${a.patients?.first_name ?? ""} ${a.patients?.last_name ?? ""}`,

    start: a.date,

    end: end.toISOString(),

    extendedProps: {
      notes: a.notes,
      status: a.status,
      patient: a.patients,
      duration_minutes: a.duration_minutes,
      notification_sent: a.notification_sent,
      notification_sent_at: a.notification_sent_at,
    },

backgroundColor:
  a.status === "cancelled"
    ? "#e53935" // rojo fuerte
    : a.status === "completed"
    ? "#43a047" // verde
    : a.status === "confirmed"
    ? "#1e88e5" // azul
    : "#90a4ae", // pendiente gris

    borderWidth: a.duration_minutes === 60 ? 3 : 1,
borderColor:
  a.duration_minutes === 60
    ? "#ff9800"
    : "transparent",


 classNames: [`status-${a.status}`],
  };
});

      setEvents(mapped);
    } catch (err) {
      console.error("Error fetching appointments", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);


  const openWhatsapp = (
  phone: string,
  patientName: string,
  appointmentDate: Date
) => {
  const formattedDate = appointmentDate.toLocaleDateString("es-ES");

  const formattedTime = appointmentDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const message =
    `Hola ${patientName} 😊.\n\n` +
    `Te recordamos que tienes una cita el ${formattedDate} a las ${formattedTime}.\n\n` +
    `Si necesitas cambiarla, avísanos.\n\n` +
    `¡Gracias!`;

  const cleanPhone = phone.replace(/\D/g, "");

  window.open(
    `https://wa.me/34${cleanPhone}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
};

  return (
    <Box
        sx={{
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
     <Box sx={{ mb: 2, flexShrink: 0 }}>
        <DatePicker
            label="Seleccion de día"
            format="DD/MM/YYYY"
        onChange={(value: Dayjs | null) => {
        if (value) {
            goToDate(value.format("YYYY-MM-DD"));
        }
        }}
        />
    </Box>
    <Box
        sx={{
           flex: 1,
            minHeight: 0,
            width: "100%",
          "& .fc": {
            fontFamily: "Inter, system-ui, sans-serif",
            border: "none",
          },

          "& .fc-toolbar": {
            mb: 2,
          },

          "& .fc-toolbar-title": {
            fontSize: "1.2rem",
            fontWeight: 700,
          },

          "& .fc-button": {
            backgroundColor: "#f5f5f5",
            border: "none",
            color: "#333",
            textTransform: "none",
            borderRadius: 2,
            boxShadow: "none",
            px: 2,
            py: 1,
          },

          "& .fc-button:hover": {
            backgroundColor: "#eaeaea",
          },

          "& .fc-button-primary:not(:disabled).fc-button-active": {
            backgroundColor: "#1976d2",
            color: "#fff",
          },
"& .fc-day-today": {
  borderLeft: `1.5px solid ${theme.palette.primary.main}`,
  borderRight: `1.5px solid ${theme.palette.primary.main}`,
},
"& .fc-timegrid-col.fc-day-today .fc-timegrid-col-frame": {
  backgroundColor: "rgba(255, 154, 134, 0.41)",
},

"& .fc-scrollgrid": {
  borderRadius: 12,
  overflow: "hidden",
  border: "1px solid #e5e7eb",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
},

"& .fc-timegrid-slot:hover": {
  backgroundColor: "#f8fafc",
},
"& .fc-timegrid-slot": {
  height: "48px !important",
  borderColor: "#eef2f7",
},

"& .fc-timegrid-slot-lane": {
  borderColor: "#f1f5f9",
},

"& .fc-timegrid-slot-label": {
  fontSize: "12px",
  color: "#555",
  fontWeight: 500,
},
"& .fc-timegrid-axis": {
  backgroundColor: "#fafafa",
  fontWeight: 600,
  color: "#333",
},
"& .fc-scrollgrid td, & .fc-scrollgrid th": {
  borderColor: theme.palette.secondary.main,
},


          "& .fc-col-header-cell": {
            backgroundColor: "#fafafa",
            padding: "8px 0",
            fontWeight: 600,
            color: "#444",
          },
          
        }}
      >
      <FullCalendar
        ref={calendarRef}
        timeZone="local"
        allDaySlot={false}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        height="85vh"
        locale={esLocale}
        firstDay={1}

        // 🧭 HEADER PRO
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}

        // ⏱ FORMATO 24H (TU CASO)
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}

        // 🎯 eventos
        events={events}

        // 🧠 UI PRO de cada evento
       eventContent={(arg) => {
  const { timeText, event } = arg;
const isLong = event.extendedProps.duration_minutes === 60;
  return (
    <div
        style={{
        padding: "4px 6px",
        borderRadius: 6,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: isLong ? "space-between" : "flex-start",
        fontSize: 12,
      }}
    >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: 700,
        gap: 8,
      }}
    >
      <span>{timeText}</span>

      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {event.extendedProps.status === "pending"
          ? "⏳ Pendiente"
          : event.extendedProps.status === "confirmed"
          ? "✅ Confirmada"
          : event.extendedProps.status === "completed"
          ? "🏁 Completada"
          : "❌ Cancelada"}
      </span>
    </div>

      <div style={{ opacity: 0.9 }}>
        {event.title}
      </div>
    </div>
  );
}}

        // 👇 CLICK (base para modal futuro)
eventClick={(info) => {
  setSelectedEvent(info.event);
  setOpenDialog(true);
}}
      />
      </Box>

      <Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  maxWidth="xs"
  fullWidth
>
  <DialogTitle>
    {selectedEvent?.title}
  </DialogTitle>

  <DialogContent>
    <Typography variant="body2" sx={{ mb: 1 }}>
      📅{" "}
      {selectedEvent?.start?.toLocaleDateString("es-ES")}
    </Typography>

    <Typography variant="body2" sx={{ mb: 1 }}>
      🕒{" "}
      {selectedEvent?.start?.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </Typography>

    <Typography variant="body2">
      Estado: {selectedEvent?.extendedProps.status}
    </Typography>
  </DialogContent>

  <DialogActions
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 1,
      p: 2,
    }}
  >
    <Button
      fullWidth
      variant="contained"
      color="success"
      startIcon={<WhatsAppIcon />}
      onClick={() => {
        const patient = selectedEvent.extendedProps.patient;

        openWhatsapp(
          patient.phone,
          patient.first_name,
          selectedEvent.start
        );

        setOpenDialog(false);
      }}
    >
      Enviar WhatsApp
    </Button>

    <Button
      fullWidth
      variant="outlined"
      startIcon={<EditIcon />}
    >
      Editar cita
    </Button>

    <Button
      fullWidth
      variant="outlined"
      color="success"
      startIcon={<CheckCircleIcon />}
    >
      Marcar completada
    </Button>

    <Button
      fullWidth
      variant="outlined"
      color="error"
      startIcon={<CancelIcon />}
    >
      Cancelar cita
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}