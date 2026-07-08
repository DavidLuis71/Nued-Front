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
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
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
  <Box
    sx={{
       width: "100%", 
    }}
  >
    {/* HEADER */}
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4">🕒 Agenda</Typography>
      <Typography variant="body2" color="text.secondary">
        Horarios, vacaciones y excepciones
      </Typography>
    </Box>

    {/* GRID LAYOUT */}
    <Grid container spacing={1}>

      {/* ===================== HORARIO ===================== */}
      <Grid  size={{ xs: 12, md: 6 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
            height: "100%",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Horario semanal
          </Typography>

       <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{
            flexWrap: "wrap",
          }}
        >
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
              sx={{ minWidth: 120 }}
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

            <Button
              variant="contained"
              sx={{ height: 56, px: 3, minWidth: 120 }}
              onClick={createSchedule}
            >
              Añadir
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            {Object.keys(grouped).map((day) => (
              <Box key={day}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {days[Number(day)]}
                </Typography>

                {grouped[day].map((s: WorkSchedule) => (
                  <Box
                    key={s.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 1.5,
                      py: 1,
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <Chip
                      label={`${formatTime(s.start_time)} - ${formatTime(
                        s.end_time
                      )}`}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteSchedule(s.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>

      {/* ===================== VACACIONES ===================== */}
      <Grid  size={{ xs: 12, md: 6 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
            height: "100%",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Vacaciones
          </Typography>

           <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{
            flexWrap: "wrap",
          }}
        >
            <TextField
              type="date"
              sx={{ minWidth: 160 }}
              value={closureForm.start_date}
              onChange={(e) =>
                setClosureForm({
                  ...closureForm,
                  start_date: e.target.value,
                })
              }
            />

            <TextField
              type="date"
              sx={{ minWidth: 160 }}
              value={closureForm.end_date}
              onChange={(e) =>
                setClosureForm({
                  ...closureForm,
                  end_date: e.target.value,
                })
              }
            />

            <TextField
              label="Motivo"
              value={closureForm.reason}
              onChange={(e) =>
                setClosureForm({
                  ...closureForm,
                  reason: e.target.value,
                })
              }
            />

            <Button
              variant="contained"
              color="error"
              onClick={createClosure}
            >
              Bloquear
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            {closures.map((c) => (
              <Box
                key={c.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "rgba(0,0,0,0.02)",
                }}
              >
                <Chip
                  label={`${formatDate(c.start_date)} → ${formatDate(
                    c.end_date
                  )}`}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => deleteClosure(c.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>

      {/* ===================== EXCEPCIONES ===================== */}
      <Grid >
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Días especiales
          </Typography>

           <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{
            flexWrap: "wrap",
          }}
        >
            <TextField
              type="date"
              sx={{ minWidth: 160 }}
              value={exceptionForm.date}
              onChange={(e) =>
                setExceptionForm({
                  ...exceptionForm,
                  date: e.target.value,
                })
              }
            />

            <TextField
              type="time"
              sx={{ minWidth: 120 }}
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
              value={exceptionForm.end_time}
              onChange={(e) =>
                setExceptionForm({
                  ...exceptionForm,
                  end_time: e.target.value,
                })
              }
            />

            <Button variant="contained" onClick={createException}>
              Añadir
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            {exceptions.map((e) => (
              <Box
                key={e.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "rgba(0,0,0,0.02)",
                }}
              >
                <Chip
                  label={
                    e.closed
                      ? `${formatDate(e.date)} (CERRADO)`
                      : `${formatDate(e.date)} · ${formatTime(
                          e.start_time!
                        )} - ${formatTime(e.end_time!)}`
                  }
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => deleteException(e.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>

    </Grid>
  </Box>
);
}