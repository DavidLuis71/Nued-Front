import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useRef } from "react";
import { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import type { EventContentArg, EventClickArg } from "@fullcalendar/core";
import { apiFetch } from "../api/api";

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
    },

  backgroundColor:
  a.duration_minutes === 60
    ? "#ff9800" // 🟠 primera visita
    : "#1976d2", // 🔵 normal

    borderColor:
  a.status === "confirmed"
    ? "#1565c0"
    : a.status === "completed"
    ? "#1b5e20"
    : a.status === "cancelled"
    ? "#b71c1c"
    : "transparent",

     classNames:
    a.duration_minutes === 60
      ? ["event-long"]
      : ["event-normal"],
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

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
     <Box sx={{ mb: 2 }}>
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
    height: "100%",
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

    "& .fc-scrollgrid": {
      borderRadius: 3,
      overflow: "hidden",
      border: "1px solid #eee",
    },

    "& .fc-timegrid-slot": {
      height: "42px !important",
    },

    "& .fc-timegrid-slot-label": {
      fontSize: "12px",
      color: "#666",
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
        locale="es"
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

  return (
    <div
      style={{
        padding: "4px 6px",
        borderRadius: "6px",
        fontSize: "12px",
        lineHeight: 1.2,
      }}
    >
      <div style={{ fontWeight: 700 }}>
        {timeText}
      </div>

      <div style={{ opacity: 0.9 }}>
        {event.title}
      </div>

      {event.extendedProps?.status && (
        <div
          style={{
            fontSize: "10px",
            marginTop: "2px",
            opacity: 0.7,
          }}
        >
          {event.extendedProps.status}
        </div>
      )}
    </div>
  );
}}

        // 👇 CLICK (base para modal futuro)
        eventClick={(info: EventClickArg) => {
          console.log("Cita:", info.event);
          console.log("Paciente:", info.event.extendedProps?.patient);
        }}
      />
      </Box>
    </Box>
  );
}