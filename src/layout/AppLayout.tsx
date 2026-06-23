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
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Collapse } from "@mui/material";
import logo from "../../public/nued.jpg";
import MenuIcon from "@mui/icons-material/Menu";
import { supabase } from "../lib/supabase";

const drawerWidth = 180;

export default function AppLayout() {
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
const [openProducts, setOpenProducts] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

const handleLogout = async () => {
  await supabase.auth.signOut();
  navigate("/login");
};

  const handleNavigate = (path: string) => {
    navigate(path);
 setOpenProducts(false);
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

      <ListItemButton onClick={() => handleNavigate("/settings/appointment-types")}>
      <ListItemText primary="Tipos de cita" />
    </ListItemButton>

  <ListItemButton onClick={() => setOpenProducts(!openProducts)}>
  <ListItemText primary="📦 Productos" />
  {openProducts ? <ExpandLess /> : <ExpandMore />}
</ListItemButton>

<Collapse in={openProducts} timeout="auto" unmountOnExit>
  <List component="div" disablePadding>

    <ListItemButton
      sx={{ pl: 4 }}
      onClick={() => handleNavigate("/products")}
    >
      <ListItemText primary="🛒 Caja (POS)" />
    </ListItemButton>

    <ListItemButton
      sx={{ pl: 4 }}
      onClick={() => handleNavigate("/products/management")}
    >
      <ListItemText primary="📋 Gestión" />
    </ListItemButton>

    <ListItemButton
      sx={{ pl: 4 }}
      onClick={() => handleNavigate("/sales")}
    >
      <ListItemText primary="🧾 Ventas" />
    </ListItemButton>
     <ListItemButton
      sx={{ pl: 4 }}
      onClick={() => handleNavigate("/accounting")}
    >
      <ListItemText primary="💰 Contabilidad" />
    </ListItemButton> 

  </List>
</Collapse>

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
          p: 1.5,
          width: "100%",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}