import { Box, CircularProgress, Typography } from "@mui/material";
type LoadingScreenProps = {
  message?: string;
};

export default function LoadingScreen({
  message = "Cargando información...",
}: LoadingScreenProps) {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, rgba(231,245,246,1) 0%, white 100%)",
      }}
    >
      {/* <Typography
        variant="h2"
        sx={{
          fontWeight: 900,
          color: "primary.main",
          letterSpacing: "0.15em",
          animation: "float 3s ease-in-out infinite",
          "@keyframes float": {
            "0%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-8px)" },
            "100%": { transform: "translateY(0px)" },
          },
        }}
      >
        NUED
      </Typography> */}
      <Box
  component="img"
    src="/nued.jpg"
  alt="NUED"
 sx={{
  width: 140,
  height: 140,
  objectFit: "cover",
  borderRadius: "50%",
  animation: "float 3s ease-in-out infinite",
  filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.15))",
}}
/>

      <Box
        sx={{
          width: 80,
          height: 4,
          bgcolor: "secondary.main",
          borderRadius: 10,
          my: 2,
        }}
      />

      <CircularProgress
        size={32}
        sx={{
          color: "secondary.main",
          mb: 2,
        }}
      />

      <Typography color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}