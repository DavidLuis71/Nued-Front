import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4">
        Dashboard
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate("/patients")}
        sx={{ mr: 2 }}
      >
        Ver pacientes
      </Button>

      <Button
        variant="contained"
        onClick={() => navigate("/appointments")}
      >
        Ver citas
      </Button>
    </Box>
  );
}