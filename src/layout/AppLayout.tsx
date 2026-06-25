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
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentsIcon from "@mui/icons-material/Payments";
import LogoutIcon from "@mui/icons-material/Logout";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import { ListItemIcon } from "@mui/material";
import { supabase } from "../lib/supabase";

const drawerWidth = 180;
const menuIconStyle = {
  color: "primary.main",
  //  color: "secondary.main",
  minWidth: 40,
};

export default function AppLayout() {
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
const [openProducts, setOpenProducts] = useState(false);
const [openAppointments, setOpenAppointments] = useState(false);
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
        <ListItemIcon
         sx={menuIconStyle}
        >
          <DashboardIcon />
        </ListItemIcon>

        <ListItemText primary="Dashboard" />
      </ListItemButton>

      <ListItemButton onClick={() => handleNavigate("/foodDataTable")}>
        <ListItemIcon
         sx={menuIconStyle}
        >
          <MonitorWeightIcon />
        </ListItemIcon>

        <ListItemText primary="Comida" />
      </ListItemButton>

        <ListItemButton onClick={() => handleNavigate("/patients")}>
          <ListItemIcon
             sx={menuIconStyle}
          >
            <PeopleIcon />
          </ListItemIcon>

          <ListItemText primary="Pacientes" />
        </ListItemButton>

    <ListItemButton onClick={() => setOpenAppointments(!openAppointments)}>
  <ListItemIcon sx={menuIconStyle}>
    <EventIcon />
  </ListItemIcon>

  <ListItemText primary="Citas" />

  {openAppointments ? <ExpandLess /> : <ExpandMore />}
</ListItemButton>

<Collapse in={openAppointments} timeout="auto" unmountOnExit>
  <List component="div" disablePadding>

    
<ListItemButton
  sx={{ pl: 4 }}
  onClick={() => handleNavigate("/settings/work-schedule")}
>
  <ListItemIcon sx={menuIconStyle}>
    <EventIcon />
  </ListItemIcon>

  <ListItemText primary="Horarios" />
</ListItemButton>

    <ListItemButton
      sx={{ pl: 4 }}
      onClick={() => handleNavigate("/appointments")}
    >
      <ListItemIcon sx={menuIconStyle}>
        <EventIcon />
      </ListItemIcon>

      <ListItemText primary="Calendario" />
    </ListItemButton>

    <ListItemButton
      sx={{ pl: 4 }}
      onClick={() => handleNavigate("/settings/appointment-types")}
    >
      <ListItemIcon sx={menuIconStyle}>
        <MedicalServicesIcon />
      </ListItemIcon>

      <ListItemText primary="Tipos" />
    </ListItemButton>

  </List>
</Collapse>
   
        <ListItemButton onClick={() => handleNavigate("/accounting")}>
          <ListItemIcon
             sx={menuIconStyle}
          >
            <PaymentsIcon />
          </ListItemIcon>

          <ListItemText primary="Contabilidad" />
        </ListItemButton>

          <ListItemButton 
                    onClick={() => setOpenProducts(!openProducts)}>
            <ListItemIcon sx={menuIconStyle}>
              <Inventory2Icon />
            </ListItemIcon>

            <ListItemText primary="Productos" />

            {openProducts ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

<Collapse in={openProducts} timeout="auto" unmountOnExit>
  <List component="div" disablePadding>

      <ListItemButton
           sx={{ pl: 4 }}
        onClick={() => handleNavigate("/products")}
      >
        <ListItemIcon    sx={menuIconStyle}>
          <PointOfSaleIcon />
        </ListItemIcon>

        <ListItemText primary="Caja" />
      </ListItemButton>

            <ListItemButton
            sx={{ pl: 4 }}
            onClick={() => handleNavigate("/products/management")}
          >
            <ListItemIcon
             sx={menuIconStyle}
            >
              <Inventory2Icon />
            </ListItemIcon>

            <ListItemText primary="Gestión" />
          </ListItemButton>

            <ListItemButton
            sx={{ pl: 4 }}
            onClick={() => handleNavigate("/sales")}
          >
            <ListItemIcon
              sx={menuIconStyle}
            >
              <ReceiptLongIcon />
            </ListItemIcon>

            <ListItemText primary="Ventas" />
          </ListItemButton>
    </List>
</Collapse>

            <ListItemButton onClick={handleLogout}>
          <ListItemIcon
            sx={{
              color: "error.main",
              minWidth: 40,
            }}
          >
            <LogoutIcon />
          </ListItemIcon>

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