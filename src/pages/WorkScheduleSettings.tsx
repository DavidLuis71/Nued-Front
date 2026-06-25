import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  IconButton,
  TextField,
  Divider,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { apiFetch } from "../api/api";
import { formatDate, formatTime } from "../helpers/utils";

/* =========================
   TYPES
========================= */

type WorkSchedule = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type Closure = {
  id: string;
  start_date: string;
  end_date: string;
  reason?: string;
};

type Exception = {
  id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  closed: boolean;
};

const days = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

/* =========================
   COMPONENT
========================= */

export default function WorkScheduleSettings() {
  /* =========================
     STATE
  ========================= */

  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [closures, setClosures] = useState<Closure[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     FORMS
  ========================= */

  const [scheduleForm, setScheduleForm] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "14:00",
  });

  const [closureForm, setClosureForm] = useState({
    start_date: "",
    end_date: "",
    reason: "",
  });

  const [exceptionForm, setExceptionForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    closed: false,
  });

  /* =========================
     FETCH ALL
  ========================= */

  const fetchAll = async () => {
    const [w, c, e] = await Promise.all([
      apiFetch("/schedule/work-schedules").then((r) => r.json()),
      apiFetch("/schedule/closures").then((r) => r.json()),
      apiFetch("/schedule/schedule-exceptions").then((r) => r.json()),
    ]);

    setSchedules(w);
    setClosures(c);
    setExceptions(e);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* =========================
     WORK SCHEDULE
  ========================= */

  const createSchedule = async () => {
    await apiFetch("/schedule/work-schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scheduleForm),
    });

    fetchAll();
  };

  const deleteSchedule = async (id: string) => {
    await apiFetch(`/schedule/work-schedules/${id}`, { method: "DELETE" });
    fetchAll();
  };

  /* =========================
     CLOSURES (VACACIONES)
  ========================= */

  const createClosure = async () => {
    await apiFetch("/schedule/closures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(closureForm),
    });

    fetchAll();
  };

  const deleteClosure = async (id: string) => {
    await apiFetch(`/schedule/closures/${id}`, { method: "DELETE" });
    fetchAll();
  };

  /* =========================
     EXCEPTIONS
  ========================= */

  const createException = async () => {
    await apiFetch("/schedule/schedule-exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exceptionForm),
    });

    fetchAll();
  };

  const deleteException = async (id: string) => {
    await apiFetch(`/schedule/schedule-exceptions/${id}`, { method: "DELETE" });
    fetchAll();
  };

  /* =========================
     GROUP BY DAY
  ========================= */

  const grouped = schedules.reduce((acc: any, curr) => {
    if (!acc[curr.day_of_week]) acc[curr.day_of_week] = [];
    acc[curr.day_of_week].push(curr);
    return acc;
  }, {});

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
      <Typography variant="h5" >
        🕒 Configuración de agenda
      </Typography>

      {/* =====================================================
          1. WORK SCHEDULE
      ===================================================== */}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Horario semanal</Typography>

        <Stack direction="row" spacing={2} >
          <TextField
            select
            label="Día"
            slotProps={{ select: { native: true } }}
            value={scheduleForm.day_of_week}
            onChange={(e) =>
              setScheduleForm({
                ...scheduleForm,
                day_of_week: Number(e.target.value),
              })
            }
          >
            {days.map((d, i) => (
              <option key={i} value={i}>
                {d}
              </option>
            ))}
          </TextField>

          <TextField
            type="time"
            label="Inicio"
            value={scheduleForm.start_time}
            onChange={(e) =>
              setScheduleForm({
                ...scheduleForm,
                start_time: e.target.value,
              })
            }
          />

          <TextField
            type="time"
            label="Fin"
            value={scheduleForm.end_time}
            onChange={(e) =>
              setScheduleForm({
                ...scheduleForm,
                end_time: e.target.value,
              })
            }
          />

          <Button variant="contained" onClick={createSchedule}>
            Añadir
          </Button>
        </Stack>
      </Paper>

      {/* =====================================================
          2. VACACIONES
      ===================================================== */}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Vacaciones</Typography>

        <Stack direction="row" spacing={2} >
          <TextField
            type="date"
            label="Inicio"
           
            value={closureForm.start_date}
            onChange={(e) =>
              setClosureForm({ ...closureForm, start_date: e.target.value })
            }
          />

          <TextField
            type="date"
            label="Fin"
        
            value={closureForm.end_date}
            onChange={(e) =>
              setClosureForm({ ...closureForm, end_date: e.target.value })
            }
          />

          <TextField
            label="Motivo"
            value={closureForm.reason}
            onChange={(e) =>
              setClosureForm({ ...closureForm, reason: e.target.value })
            }
          />

          <Button variant="contained" color="error" onClick={createClosure}>
            Bloquear
          </Button>
        </Stack>
      </Paper>

      {/* =====================================================
          3. EXCEPCIONES
      ===================================================== */}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Días especiales</Typography>

        <Stack direction="row" spacing={2}>
          <TextField
            type="date"
            value={exceptionForm.date}
            onChange={(e) =>
              setExceptionForm({ ...exceptionForm, date: e.target.value })
            }
          />

          <TextField
            type="time"
            label="Inicio"
            value={exceptionForm.start_time}
            onChange={(e) =>
              setExceptionForm({
                ...exceptionForm,
                start_time: e.target.value,
              })
            }
          />

          <TextField
            type="time"
            label="Fin"
            value={exceptionForm.end_time}
            onChange={(e) =>
              setExceptionForm({ ...exceptionForm, end_time: e.target.value })
            }
          />

          <Button variant="contained" onClick={createException}>
            Añadir
          </Button>
        </Stack>
      </Paper>

      {/* =====================================================
          LISTADOS
      ===================================================== */}

      <Stack spacing={3}>
        {/* SCHEDULE LIST */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Horarios actuales</Typography>

          {Object.keys(grouped).map((day) => (
            <Box key={day}>
              <Typography >{days[Number(day)]}</Typography>

              {grouped[day].map((s: WorkSchedule) => (
                <Stack
                  key={s.id}
                  direction="row"
                  
                  sx={{ p: 1 }}
                >
                  <Chip label={`${formatTime(s.start_time)} - ${formatTime(s.end_time)}`} />
                  <IconButton onClick={() => deleteSchedule(s.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
            </Box>
          ))}
        </Paper>

        {/* CLOSURES */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Vacaciones</Typography>

          {closures.map((c) => (
            <Stack
              key={c.id}
              direction="row"
             
            >
             <Chip
                    label={`${formatDate(c.start_date)} → ${formatDate(c.end_date)}`}
                    />
              <IconButton onClick={() => deleteClosure(c.id)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}
        </Paper>

        {/* EXCEPTIONS */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Excepciones</Typography>

          {exceptions.map((e) => (
            <Stack
              key={e.id}
              direction="row"
             
            >
              <Chip
                label={
                    e.closed
                        ? `${formatDate(e.date)} (CERRADO)`
                        : `${formatDate(e.date)} · ${formatTime(e.start_time!)} - ${formatTime(e.end_time!)}`
                    }
              />
              <IconButton onClick={() => deleteException(e.id)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}
        </Paper>
      </Stack>
    </Box>
  );
}