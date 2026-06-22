import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
} from "@mui/material";
import { apiFetch } from "../api/api";

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
};

type Appointment = {
  id: string;
  date: string;
  status: string;
  notes: string;
  duration_minutes: number,
};

export default function PatientDetail() {
  const { id } = useParams();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
const [availability, setAvailability] = useState<Appointment[]>([]);
const [selectedSlot, setSelectedSlot] = useState<string>("");

const [editForm, setEditForm] = useState({
  date: "",
  notes: "",
  duration_minutes: 30,
});

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  });

  const [newAppointment, setNewAppointment] = useState({
  date: "",
  notes: "",
  status: "pending",
  duration_minutes: 30,
});


const fetchAvailability = async (date: string) => {
const res = await apiFetch(`/availability?date=${date}`);

  const data = await res.json();
  setAvailability(data);
};

const refreshData = async () => {
  await fetchPatient();

  if (selectedDate) {
    await fetchAvailability(selectedDate);
  }
};

const createAppointment = async () => {
  setErrorMsg(null);

  try {
    const res = await apiFetch("/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patient_id: id,
        ...newAppointment,
        date: new Date(newAppointment.date).toISOString(),
      }),
    });

    const data = await res.json();

    // ❌ backend devuelve error controlado
    if (!res.ok) {
      setErrorMsg(data.error || "Error creando la cita");
      return;
    }

    // ✅ éxito
    setNewAppointment({
      date: "",
      notes: "",
      status: "pending",
      duration_minutes: 30,
    });

    await refreshData();
  } catch (err) {
    setErrorMsg("Error de conexión con el servidor");
  }
};

const updateStatus = async (id: string, status: string) => {
   await apiFetch(`/appointments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  await refreshData();
};

const updateAppointment = async (id: string) => {
   await apiFetch(`/appointments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({

...editForm,

date: new Date(editForm.date).toISOString(),

})
    
  });

  setEditingAppointment(null);
 await refreshData();
};

  // 🔄 fetch patient
const fetchPatient = async () => {
  const patientRes = await apiFetch(`/patients/${id}`);
  const patientData = await patientRes.json();

 const apptRes = await apiFetch(`/patients/${id}/appointments`);
  const apptData = await apptRes.json();

  setPatient(patientData);
  setAppointments(apptData);

  setForm({
    first_name: patientData.first_name,
    last_name: patientData.last_name,
    phone: patientData.phone,
    email: patientData.email,
  });
};


  useEffect(() => {
    fetchPatient();
  }, [id]);

  const isSlotFree = (slot: Date, duration: number) => {
  const slotEnd = new Date(slot);
  slotEnd.setMinutes(slotEnd.getMinutes() + duration);

  return !availability.some((a) => {
    const aStart = new Date(a.date);
    const aEnd = new Date(a.date);
    aEnd.setMinutes(aEnd.getMinutes() + a.duration_minutes);

    return slot < aEnd && slotEnd > aStart;
  });
};
const generateSlots = (date: string) => {
  const slots = [];

  const base = new Date(date);
  base.setHours(8, 0, 0, 0);

  const end = new Date(date);
  end.setHours(20, 0, 0, 0);

  while (base < end) {
    slots.push(new Date(base));
    base.setMinutes(base.getMinutes() + 30);
  }

  return slots;
};

  // ✏️ update patient
  const updatePatient = async () => {
   await apiFetch(`/patients/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setEditMode(false);
  await refreshData();
  };

  if (!patient) return <div>Cargando...</div>;

return (
  <Box sx={{ maxWidth: 1100, mx: "auto" }}>   
    {/* DATOS PACIENTE */}
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
      {editMode ? (
        <Box>
          <Typography variant="h6">
            Editar paciente
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Nombre"
              value={form.first_name}
              onChange={(e) =>
                setForm({ ...form, first_name: e.target.value })
              }
            />

            <TextField
              label="Apellidos"
              value={form.last_name}
              onChange={(e) =>
                setForm({ ...form, last_name: e.target.value })
              }
            />

            <TextField
              label="Teléfono"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <TextField
              label="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={updatePatient}>
                Guardar cambios
              </Button>

              <Button onClick={() => setEditMode(false)}>
                Cancelar
              </Button>
            </Stack>
          </Stack>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6">
            {patient.first_name} {patient.last_name}
          </Typography>

          <Typography color="text.secondary">
            📞 {patient.phone}
          </Typography>

          <Typography color="text.secondary">
            ✉️ {patient.email}
          </Typography>

          <Button sx={{ mt: 2 }} variant="outlined" onClick={() => setEditMode(true)}>
            Editar paciente
          </Button>
        </Box>
      )}
    </Paper>

    {/* NUEVA CITA */}
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
      <Typography variant="h6">
        Nueva cita
      </Typography>

      <Stack spacing={2}>
        <TextField
          type="date"
          value={selectedDate}
          onChange={(e) => {
            const date = e.target.value;
            setSelectedDate(date);
            fetchAvailability(date);
          }}
        />

        <Typography variant="subtitle2">
          Huecos disponibles
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {selectedDate &&
            generateSlots(selectedDate)
              .filter((slot) =>
                isSlotFree(slot, newAppointment.duration_minutes)
              )
              .map((slot) => (
                <Button
                  key={slot.toISOString()}
                  variant={
                    selectedSlot === slot.toISOString()
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => {
                    setSelectedSlot(slot.toISOString());
                    setNewAppointment({
                      ...newAppointment,
                      date: slot.toISOString(),
                    });
                  }}
                >
                  {slot.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Button>
              ))}
        </Box>

        <FormControl>
          <Typography variant="subtitle2">
            Tipo de cita
          </Typography>

          <RadioGroup
            row
            value={newAppointment.duration_minutes}
            onChange={(e) =>
              setNewAppointment({
                ...newAppointment,
                duration_minutes: Number(e.target.value),
              })
            }
          >
            <FormControlLabel value={30} control={<Radio />} label="30 min" />
            <FormControlLabel value={60} control={<Radio />} label="60 min" />
          </RadioGroup>
        </FormControl>

        <TextField
          label="Notas"
          value={newAppointment.notes}
          onChange={(e) =>
            setNewAppointment({
              ...newAppointment,
              notes: e.target.value,
            })
          }
        />

        <Button variant="contained" onClick={createAppointment}>
          Crear cita
        </Button>
      </Stack>

      {errorMsg && (
        <Typography color="error">
          {errorMsg}
        </Typography>
      )}
    </Paper>

    {/* HISTORIAL CITAS */}
    <Typography variant="h6" >
      Historial de citas
    </Typography>

    <Stack spacing={2}>
      {appointments.map((a) => (
        <Paper key={a.id} sx={{ p: 2, borderRadius: 3 }}>
          <Typography >
            📅 {new Date(a.date).toLocaleString()}
          </Typography>

          <Typography color="text.secondary">
            Estado: {a.status}
          </Typography>

          <Typography sx={{ mt: 1 }}>{a.notes}</Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button size="small" onClick={() => updateStatus(a.id, "confirmed")}>
              Confirmar
            </Button>

            <Button size="small" onClick={() => updateStatus(a.id, "completed")}>
              Completar
            </Button>

            <Button
              size="small"
              color="error"
              onClick={() => updateStatus(a.id, "cancelled")}
            >
              Cancelar
            </Button>

            <Button
              size="small"
              onClick={() => {
                setEditingAppointment(a.id);
                setEditForm({
                  date: a.date,
                  notes: a.notes,
                  duration_minutes: a.duration_minutes,
                });
              }}
            >
              Editar
            </Button>
          </Stack>

          {editingAppointment === a.id && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: "#fafafa", borderRadius: 2 }}>
              <Stack spacing={2}>
                <TextField
                  type="datetime-local"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                />

                <TextField
                  label="Notas"
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                />

                <FormControl>
                  <InputLabel>Duración</InputLabel>
                  <Select
                    value={editForm.duration_minutes}
                    label="Duración"
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        duration_minutes: Number(e.target.value),
                      })
                    }
                  >
                    <MenuItem value={30}>30 min</MenuItem>
                    <MenuItem value={60}>60 min</MenuItem>
                  </Select>
                </FormControl>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={() => updateAppointment(a.id)}
                  >
                    Guardar
                  </Button>

                  <Button onClick={() => setEditingAppointment(null)}>
                    Cancelar
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          )}
        </Paper>
      ))}
    </Stack>
  </Box>
);
}