import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api";

type Patient = {
  id: string;
  first_name: string;
  last_name?: string;
  birth_date?: string;
  height_cm?: number;
  weight_kg?: number;
  gender?: "male" | "female";
};

type NutritionFormula = {
  id: string;
  name: string;
  formula_type: string;
  gender: "male" | "female";
  use_adjusted_weight: boolean;
};

type ActivityFactor = {
  id: string;
  name: string;
  factor: number;
};


type Macros = {
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  protein_kcal: number;
  fat_kcal: number;
  carbs_kcal: number;
};

export default function PatientNutritionCalculation() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [patient, setPatient] = useState<Patient | null>(null);

  const [formulas, setFormulas] = useState<NutritionFormula[]>([]);
  const [activities, setActivities] = useState<ActivityFactor[]>([]);

  const [selectedFormula, setSelectedFormula] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");

  const [ger, setGer] = useState<number | null>(null);
  const [get, setGet] = useState<number | null>(null);

  
const navigate = useNavigate();


  const calculateMacros = (get: number, weight: number): Macros => {
  if (!get || !weight) {
    return {
      protein_g: 0,
      fat_g: 0,
      carbs_g: 0,
      protein_kcal: 0,
      fat_kcal: 0,
      carbs_kcal: 0,
    };
  }

  // 🔥 1. PROTEÍNA (2 g/kg estándar clínico base)
  const protein_g = weight * 2;
  const protein_kcal = protein_g * 4;

  // 🥑 2. GRASA (1 g/kg estándar)
  const fat_g = weight * 1;
  const fat_kcal = fat_g * 9;

  // 🍞 3. CARBOHIDRATOS (resto kcal)
  const remaining_kcal = get - (protein_kcal + fat_kcal);
  const carbs_g = remaining_kcal / 4;
  const carbs_kcal = remaining_kcal;

  return {
    protein_g,
    fat_g,
    carbs_g,
    protein_kcal,
    fat_kcal,
    carbs_kcal,
  };
};


const macros = useMemo(() => {
  if (!get || !patient?.weight_kg) return null;

  return calculateMacros(get, Number(patient.weight_kg));
}, [get, patient]);


  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 0;

    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const monthDiff =
      today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 &&
        today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const age = useMemo(
    () => calculateAge(patient?.birth_date),
    [patient]
  );

  const idealWeight = useMemo(() => {
    if (!patient?.height_cm) return 0;

    return (
      22.5 *
      Math.pow(Number(patient.height_cm) / 100, 2)
    );
  }, [patient]);

  const adjustedWeight = useMemo(() => {
    if (!patient?.weight_kg) return 0;

    return (
      idealWeight +
      0.25 *
        (Number(patient.weight_kg) -
          idealWeight)
    );
  }, [patient, idealWeight]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        patientRes,
        formulasRes,
        activitiesRes,
      ] = await Promise.all([
        apiFetch(`/patients/${id}`),
        apiFetch("/nutrition/formulas"),
        apiFetch("/nutrition/activity-factors"),
      ]);

      const patientData =
        await patientRes.json();

      const formulasData =
        await formulasRes.json();

      const activitiesData =
        await activitiesRes.json();

      setPatient(patientData);
      setActivities(activitiesData);

      const filteredFormulas =
        patientData.gender
          ? formulasData.filter(
              (f: NutritionFormula) =>
                f.gender === patientData.gender
            )
          : formulasData;

      setFormulas(filteredFormulas);

      if (filteredFormulas.length > 0) {
        setSelectedFormula(
          filteredFormulas[0].id
        );
      }

      if (activitiesData.length > 0) {
        setSelectedActivity(
          activitiesData[0].id
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNutrition = async () => {
    if (
      !patient ||
      !selectedFormula ||
      !selectedActivity
    ) {
      return;
    }

    try {
      const activity = activities.find(
        (a) => a.id === selectedActivity
      );

      if (!activity) return;

      const res = await apiFetch(
        "/nutrition/calculate",
        {
          method: "POST",
          body: JSON.stringify({
            formulaId: selectedFormula,
            age,
            weightKg: Number(
              patient.weight_kg
            ),
            heightCm: Number(
              patient.height_cm
            ),
            activityFactor: Number(
              activity.factor
            ),
            idealWeightKg: idealWeight,
            adjustedWeightKg:
              adjustedWeight,
          }),
        }
      );

      const data = await res.json();

      setGer(data.ger);
      setGet(data.get);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    calculateNutrition();
  }, [
    patient,
    selectedFormula,
    selectedActivity,
  ]);


const saveCalculation = async () => {
  if (!patient || !ger || !get || !selectedFormula || !selectedActivity) return;

  try {
    const activity = activities.find(a => a.id === selectedActivity);

    // 1. GUARDAR CÁLCULO
    const calcRes = await apiFetch("/nutrition/save-calculation", {
      method: "POST",
      body: JSON.stringify({
        patient_id: patient.id,
        formula_id: selectedFormula,
        activity_factor_id: selectedActivity,

        age,
        weight_kg: Number(patient.weight_kg),
        height_cm: Number(patient.height_cm),

        ideal_weight_kg: idealWeight,
        adjusted_weight_kg: adjustedWeight,

        ger,
        get,
      }),
    });

    const savedCalc = await calcRes.json(); // ✅ AQUÍ ESTÁ LA CLAVE

    // 2. CALCULAR MACROS
    if (!macros) return;

    // 3. GUARDAR PLAN
    await apiFetch("/nutrition/save-plan", {
      method: "POST",
      body: JSON.stringify({
        patient_id: patient.id,
        calculation_id: savedCalc.id, // ✅ AHORA SÍ EXISTE

        goal: "gain",
        target_kcal: get, // o kcal elegidas

        protein_g: macros.protein_g,
        carbs_g: macros.carbs_g,
        fat_g: macros.fat_g,

        protein_kcal: macros.protein_kcal,
        carbs_kcal: macros.carbs_kcal,
        fat_kcal: macros.fat_kcal,
      }),
    });

    alert("Cálculo y plan guardados correctamente");

  } catch (err) {
    console.error(err);
  }
};

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        p: 3,
      }}
    >
      <Paper
        sx={{
    p: 3,
    mb: 3,
    borderRadius: 4,
    color: "black",
  }}
      >
       <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <Box>
    <Typography variant="h4">
      Cálculo Nutricional
    </Typography>

    <Typography color="text.secondary">
      {patient?.first_name} {patient?.last_name}
    </Typography>
  </Box>

  <Button
    startIcon={<ArrowBackIcon />}
    variant="outlined"
    onClick={() => navigate(`/patients/${patient?.id}`)}
  >
    Volver al paciente
  </Button>
</Box>
      </Paper>

      <Grid
        container
        spacing={3}
      >
        <Grid size={{xs:12, md:6}}>
<Paper
  sx={{
    p: 3,
    borderRadius: 4,
    height: "100%",
  }}
>
  <Typography
    variant="h6"
    gutterBottom
  >
    Datos del paciente
  </Typography>

  <Grid container spacing={2}>
    <Grid size={{ xs: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: "grey.50",
        }}
      >
        <Typography variant="caption">
          Edad
        </Typography>

        <Typography variant="h5">
          {age}
        </Typography>
      </Paper>
    </Grid>

    <Grid size={{ xs: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: "grey.50",
        }}
      >
        <Typography variant="caption">
          Sexo
        </Typography>

        <Typography variant="h5">
          {patient?.gender === "male"
            ? "♂"
            : "♀"}
        </Typography>
      </Paper>
    </Grid>

    <Grid size={{ xs: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: "primary.50",
        }}
      >
        <Typography variant="caption">
          Peso
        </Typography>

        <Typography variant="h5">
          {patient?.weight_kg}
          <Typography
            component="span"
            variant="body2"
          >
            {" "}kg
          </Typography>
        </Typography>
      </Paper>
    </Grid>

    <Grid size={{ xs: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: "primary.50",
        }}
      >
        <Typography variant="caption">
          Altura
        </Typography>

        <Typography variant="h5">
          {patient?.height_cm}
          <Typography
            component="span"
            variant="body2"
          >
            {" "}cm
          </Typography>
        </Typography>
      </Paper>
    </Grid>
  </Grid>

  <Box sx={{ mt: 2 }}>
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: "info.50",
      }}
    >
      <Typography variant="body2">
        Peso ideal
      </Typography>

      <Typography variant="h6">
        {idealWeight.toFixed(2)} kg
      </Typography>

      <Typography
        variant="body2"
        sx={{ mt: 1 }}
      >
        Peso ajustado
      </Typography>

      <Typography variant="h6">
        {adjustedWeight.toFixed(4)} kg
      </Typography>
    </Paper>
  </Box>
</Paper>
        </Grid>

        <Grid size={{xs:12, md:6}}>
<Paper
  sx={{
    p: 3,
    borderRadius: 4,
    height: "100%",
  }}
>
  <Typography
    variant="h6"
    gutterBottom
  >
    Configuración
  </Typography>

  <Typography
    variant="body2"
    color="text.secondary"
    sx={{ mb: 3 }}
  >
    Selecciona la fórmula metabólica y el nivel de actividad del paciente.
  </Typography>

  <FormControl
    fullWidth
    sx={{ mb: 3 }}
  >
    <InputLabel>
      Fórmula metabólica
    </InputLabel>

    <Select
      value={selectedFormula}
      label="Fórmula metabólica"
      onChange={(e) =>
        setSelectedFormula(e.target.value)
      }
    >
      {formulas.map((formula) => (
        <MenuItem
          key={formula.id}
          value={formula.id}
        >
          {formula.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  <FormControl fullWidth>
    <InputLabel>
      Nivel de actividad
    </InputLabel>

    <Select
      value={selectedActivity}
      label="Nivel de actividad"
      onChange={(e) =>
        setSelectedActivity(e.target.value)
      }
    >
      {activities.map((activity) => (
        <MenuItem
          key={activity.id}
          value={activity.id}
        >
          {activity.name} ({activity.factor})
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Paper>
        </Grid>

        <Grid size={{xs:12}}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
            >
              Resultado
            </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
  
  <Paper sx={{ p: 2, flex: 1, minWidth: 200, bgcolor: "primary.light", color: "primary.contrastText" }}>
    <Typography variant="caption">GER</Typography>
    <Typography variant="h5">
      {ger?.toFixed(2) ?? "--"} kcal
    </Typography>
  </Paper>

  <Paper sx={{ p: 2, flex: 1, minWidth: 200, bgcolor: "secondary.light", color: "secondary.contrastText" }}>
    <Typography variant="caption">GET</Typography>
    <Typography variant="h4">
      {get?.toFixed(2) ?? "--"} kcal
    </Typography>
  </Paper>

</Box>

{macros && (
  <Paper
    sx={{
      p: 3,
      mt: 3,
      borderRadius: 4,
      bgcolor: "grey.50",
    }}
  >
    <Typography
      variant="h6"
     
      gutterBottom
    >
      Macros diarios
    </Typography>

    <Grid container spacing={2}>
      {/* HIDRATOS */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "warning.light",
            bgcolor: "warning.50",
            height: "100%",
          }}
        >
          <Typography
            variant="overline"
            color="warning.dark"
          >
            HIDRATOS
          </Typography>

          <Typography
            variant="h4"
           
          >
            {macros.carbs_g.toFixed(2)} g
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {macros.carbs_kcal.toFixed(2)} kcal
          </Typography>
        </Paper>
      </Grid>

      {/* PROTEÍNA */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "error.light",
            bgcolor: "error.50",
            height: "100%",
          }}
        >
          <Typography
            variant="overline"
            color="error.dark"
          >
            PROTEÍNA
          </Typography>

          <Typography
            variant="h4"
           
          >
            {macros.protein_g.toFixed(2)} g
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {macros.protein_kcal.toFixed(2)} kcal
          </Typography>
        </Paper>
      </Grid>

      {/* GRASA */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "success.light",
            bgcolor: "success.50",
            height: "100%",
          }}
        >
          <Typography
            variant="overline"
            color="success.dark"
          >
            GRASAS
          </Typography>

          <Typography
            variant="h4"
           
          >
            {macros.fat_g.toFixed(2)} g
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {macros.fat_kcal.toFixed(2)} kcal
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  </Paper>
)}

           <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={saveCalculation}
          >
            Guardar cálculo
          </Button>

   
            <Button
              variant="contained"
              color="success"
              sx={{ mt: 2 }}
              onClick={() =>
                navigate(`/patients/${patient?.id}/diet/generate`)
              }
            >
             Ir a la dieta diaria
            </Button>
     



          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}