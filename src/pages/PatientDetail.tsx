import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { useNavigate } from "react-router-dom";
import PaymentIcon from "@mui/icons-material/Payment";
import MoneyIcon from "@mui/icons-material/AttachMoney";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Chip,
  Divider,
  IconButton,
  Switch,
  FormGroup,
   Select,
   MenuItem,
    InputLabel
} from "@mui/material";
import { apiFetch } from "../api/api";
import LoadingScreen from "../loading/LoadingScreen";

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  birth_date?: string;
  height_cm?: number;
  weight_kg?: number;
  gender?:string;
};

type Appointment = {
  id: string;
  date: string;
  status: string;
  notes: string;
  duration_minutes: number;
  price: number;
  payment_method: "cash" | "card";
is_clinical: boolean;
  appointment_types?: {
    id: string;
    name: string;
  };
};

type Slot = {
  start: string;
  end: string;
};



export default function PatientDetail() {
  const { id } = useParams();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
const [availability, setAvailability] = useState<Slot[]>([]);
const [isClosed, setIsClosed] = useState(false);
const [selectedSlot, setSelectedSlot] = useState<string>("");
const [appointmentTypes, setAppointmentTypes] = useState<any[]>([]);
const [selectedType, setSelectedType] = useState<string>("");
const navigate = useNavigate();

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
  birth_date: "",
  height_cm: "",
  weight_kg: "",
  gender:"",
});

const [newAppointment, setNewAppointment] = useState({
  date: "",
  notes: "",
  status: "pending",
  duration_minutes: 30,
  price: 0,
  payment_method: "cash",
  appointment_type_id: "",
  is_clinical: false,
});


const fetchAvailability = async (date: string) => {
  const res = await apiFetch(`/schedule/availability?date=${date}`);
  const data = await res.json();

  setAvailability(data.slots || []);
  setIsClosed(data.closed);
};

const refreshData = async () => {
  await fetchPatient();

  if (selectedDate) {
    await fetchAvailability(selectedDate);
  }
};

const createAppointment = async () => {
  setErrorMsg(null);
    if (!newAppointment.appointment_type_id) {
    setErrorMsg("Selecciona un tipo de cita");
    return;
  }

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
      price:0,
      payment_method: "cash",
      appointment_type_id: "",
      is_clinical: false,
    });
    setSelectedType("");

    await refreshData();
  } catch (err) {
    console.log(err)
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
  birth_date: patientData.birth_date ?? "",
  height_cm: patientData.height_cm?.toString() ?? "",
  weight_kg: patientData.weight_kg?.toString() ?? "",
  gender: patientData.gender ?? "", 
});
};


  useEffect(() => {
    fetchPatient();
     const fetchTypes = async () => {
    const res = await apiFetch("/appointment-types");
    const data = await res.json();
    setAppointmentTypes(data);
  };

  fetchTypes();
  }, [id]);


  // ✏️ update patient
const updatePatient = async () => {
  await apiFetch(`/patients/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...form,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      birth_date: form.birth_date || null,
    }),
  });

  setEditMode(false);
  await refreshData();
};

if (!patient) {
  return (
    <LoadingScreen message="Cargando paciente..." />
  );
}

return (
  <Box sx={{ maxWidth: 1100, mx: "auto"}}>

    {/* 🧷 PACIENTE STICKY HEADER */}
    <Paper
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        position: "sticky",
        top: 55,
        zIndex: 10,
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
      }}
    >
      {editMode ? (
        <Stack spacing={2}>
          <Typography variant="h6">Editar paciente</Typography>

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
          <TextField
  label="Fecha de nacimiento"
  type="date"
  value={form.birth_date}
  onChange={(e) =>
    setForm({ ...form, birth_date: e.target.value })
  }
/>

<TextField
  label="Altura (cm)"
  type="number"
  value={form.height_cm}
  onChange={(e) =>
    setForm({ ...form, height_cm: e.target.value })
  }
/>

<TextField
  label="Peso (kg)"
  type="number"
  value={form.weight_kg}
  onChange={(e) =>
    setForm({ ...form, weight_kg: e.target.value })
  }
/>
<FormControl fullWidth>
  <InputLabel>Sexo</InputLabel>
  <Select
    value={form.gender || ""}
    label="Sexo"
    onChange={(e) =>
      setForm({ ...form, gender: e.target.value })
    }
  >
    <MenuItem value="male">Hombre</MenuItem>
    <MenuItem value="female">Mujer</MenuItem>
    <MenuItem value="other">Otro</MenuItem>
    <MenuItem value="unknown">No especificado</MenuItem>
  </Select>
</FormControl>

          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={updatePatient}>
              Guardar
            </Button>
            <Button onClick={() => setEditMode(false)}>
              Cancelar
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Stack >
          <Box>
            <Typography variant="h5" >
              {patient.first_name} {patient.last_name}
            </Typography>

            <Typography color="text.secondary">
              📞 {patient.phone} · ✉️ {patient.email}
            </Typography>
                <Typography color="text.secondary">
              🎂 {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString() : "Sin fecha"} ·
              📏 {patient.height_cm ?? "-"} cm ·
              ⚖️ {patient.weight_kg ?? "-"} kg
              🧬 {patient.gender ?? "No especificado"}
            </Typography>
          </Box>

         <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => setEditMode(true)}
            >
              Editar
            </Button>

            <Button
              variant="contained"
              color="success"
              startIcon={<RestaurantMenuIcon />}
              onClick={() => navigate(`/patients/${patient.id}/diet`)}
            >
              Dieta
            </Button>
          </Stack>
        </Stack>
      )}
    </Paper>

    {/* 🧩 GRID PRINCIPAL */}
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>

      {/* 📅 NUEVA CITA */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" >
          ➕ Nueva cita
        </Typography>
        <FormControl>
  <Typography variant="subtitle2">
    Duración
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
          {isClosed && (
  <Paper
    sx={{
      p: 2,
      mt: 1,
      bgcolor: "#fff3f3",
      border: "1px solid #ffcccc",
    }}
  >
    <Typography color="error" >
      🚫 Este día está cerrado por vacaciones
    </Typography>
  </Paper>
)}

<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
  {availability.map((slot) => (
    <Button
      key={slot.start}
      variant={
        selectedSlot === slot.start ? "contained" : "outlined"
      }
      onClick={() => {
        setSelectedSlot(slot.start);

        setNewAppointment({
          ...newAppointment,
          date: slot.start,
        });
      }}
    >
      {new Date(slot.start).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </Button>
  ))}
</Box>

          {/* 💳 NUEVO BLOQUE: PAGO + PRECIO */}
        <FormControl>
  <Typography variant="subtitle2">
    Tipo de cita
  </Typography>

  <RadioGroup
    value={selectedType}
    onChange={(e) => {
      const typeId = e.target.value;
      const type = appointmentTypes.find(t => t.id === typeId);

      setSelectedType(typeId);

      setNewAppointment({
        ...newAppointment,
        appointment_type_id: typeId,
        price: type?.price ?? 0,
        duration_minutes: type?.duration_minutes ?? 30,
      });
    }}
  >
    {appointmentTypes.map((t) => (
      <FormControlLabel
        key={t.id}
        value={t.id}
        control={<Radio />}
        label={
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Typography>{t.name}</Typography>
          </Box>
        }
      />
    ))}
  </RadioGroup>
</FormControl>

<FormGroup>
  <FormControlLabel
    control={
      <Switch
        checked={newAppointment.is_clinical}
        onChange={(e) =>
          setNewAppointment({
            ...newAppointment,
            is_clinical: e.target.checked,
          })
        }
      />
    }
    label="Consulta clínica"
  />
</FormGroup>

        <FormControl>
  <Typography variant="subtitle2">
    Método de pago
  </Typography>

  <RadioGroup
    row
    value={newAppointment.payment_method}
    onChange={(e) =>
      setNewAppointment({
        ...newAppointment,
        payment_method: e.target.value,
      })
    }
  >
<FormControlLabel
  value="cash"
  control={<Radio />}
  label={
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <MoneyIcon fontSize="small" />
      <Typography>Efectivo</Typography>
    </Box>
  }
/>

<FormControlLabel
  value="card"
  control={<Radio />}
  label={
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <PaymentIcon fontSize="small" />
      <Typography>Tarjeta</Typography>
    </Box>
  }
/>
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

          {errorMsg && (
            <Typography color="error">{errorMsg}</Typography>
          )}
        </Stack>
      </Paper>

      {/* 📋 HISTORIAL */}
      <Box>
        <Typography variant="h6" >
          📋 Historial de citas
        </Typography>

        <Stack spacing={2}>
{appointments.map((a) => {
  const statusColor =
    a.status === "completed"
      ? "success"
      : a.status === "cancelled"
      ? "error"
      : a.status === "confirmed"
      ? "primary"
      : "warning";

  return (
    <Paper
      key={a.id}
      sx={{
        p: 0,
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        transition: "0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* barra lateral estado */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          bgcolor: `${statusColor}.main`,
        }}
      />

      <Box sx={{ p: 2, pl: 3 }}>
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography >
            📅 {new Date(a.date).toLocaleString()}
          </Typography>

          <Chip
            size="small"
            label={a.status}
            color={statusColor as any}
            variant="outlined"
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* BODY */}


        <Box sx={{ mt: 1 }}>
  {a.appointment_types && (
    <Typography variant="body2">
      🩺 {a.appointment_types.name}
    </Typography>
  )}

  <Typography variant="body2">
    ⏱ {a.duration_minutes} min
  </Typography>

  <Typography variant="body2">
    💰 {a.price}€
  </Typography>

  <Typography variant="body2">
    {a.payment_method === "cash"
      ? "💵 Efectivo"
      : "💳 Tarjeta"}
  </Typography>
</Box>

{a.is_clinical && (
  <Chip
    size="small"
    color="secondary"
    label="Clínica"
    sx={{ mt: 1 }}
  />
)}

        {a.notes && (
          <Typography sx={{ mt: 1 }}>
            {a.notes}
          </Typography>
        )}

        {/* FOOTER ACTIONS */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 2,
            flexWrap: "wrap",
          }}
        >
          <IconButton
            size="small"
            onClick={() => updateStatus(a.id, "confirmed")}
            color="primary"
          >
            <CheckIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => updateStatus(a.id, "completed")}
            color="success"
          >
            <DoneAllIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => updateStatus(a.id, "cancelled")}
            color="error"
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <IconButton
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
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* EDIT MODE (igual que el tuyo pero embebido bonito) */}
        {editingAppointment === a.id && (
          <Box sx={{ mt: 2 }}>
            <Paper sx={{ p: 2, bgcolor: "#fafafa" }}>
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

                <RadioGroup
                  row
                  value={editForm.duration_minutes}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      duration_minutes: Number(e.target.value),
                    })
                  }
                >
                  <FormControlLabel value={30} control={<Radio />} label="30 min" />
                  <FormControlLabel value={60} control={<Radio />} label="60 min" />
                </RadioGroup>

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
          </Box>
        )}
      </Box>
    </Paper>
  );
})}
        </Stack>
      </Box>

    </Box>
  </Box>
);
}