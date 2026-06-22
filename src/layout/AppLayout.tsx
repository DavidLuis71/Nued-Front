import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import logo from "../assets/nued.jpg";
import MenuIcon from "@mui/icons-material/Menu";

const drawerWidth = 180;

export default function AppLayout() {
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login");
};

  const handleNavigate = (path: string) => {
    navigate(path);

    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const menuContent = (
    <List>
      <ListItemButton onClick={() => handleNavigate("/dashboard")}>
        <ListItemText primary="Dashboard" />
      </ListItemButton>

      <ListItemButton onClick={() => handleNavigate("/patients")}>
        <ListItemText primary="Pacientes" />
      </ListItemButton>

      <ListItemButton onClick={() => handleNavigate("/appointments")}>
        <ListItemText primary="Citas" />
      </ListItemButton>

      <ListItemButton onClick={() => handleNavigate("/patients")}>
        <ListItemText primary="Contabilidad" />
      </ListItemButton>
      <ListItemButton onClick={handleLogout}>
        <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
    </List>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* TOP BAR */}
      <AppBar
        position="fixed"
        color="primary"
        sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  <Box
  component="img"
  src={logo}
  alt="NUED"
  sx={{
    height: 58,
    width: 58,
    borderRadius: "50%",
    objectFit: "cover",
  }}
/>

  {/* <Typography
    variant="h6"
    sx={{
      fontWeight: 700,
      letterSpacing: 0.5,
    }}
  >
    NUED
  </Typography> */}
</Box>
        </Toolbar>
      </AppBar>

      {/* DESKTOP DRAWER */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
                bgcolor: "background.default",
  borderRight: "1px solid rgba(0,0,0,0.08)",
            },
          }}
        >
          <Toolbar />
          {menuContent}
        </Drawer>
      )}

      {/* MOBILE DRAWER */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
            },
          }}
        >
          <Toolbar />
          {menuContent}
        </Drawer>
      )}

      {/* CONTENIDO */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: "100%",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}