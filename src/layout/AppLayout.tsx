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
  Collapse,
} from "@mui/material";
import { useMediaQuery, useTheme } from "@mui/material";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
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
import logo from "../../public/nued.jpg";

const drawerWidth = 260;

const menuIconStyle = {
  color: "primary.main",
  minWidth: 40,
};

export default function AppLayout() {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openProducts, setOpenProducts] = useState(false);
  const [openAppointments, setOpenAppointments] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const menuContent = (
    <List sx={{ width: drawerWidth }}>
      {/* DASHBOARD */}
      <ListItemButton onClick={() => handleNavigate("/dashboard")}>
        <ListItemIcon sx={menuIconStyle}>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>

      {/* COMIDA */}
      <ListItemButton onClick={() => handleNavigate("/foodDataTable")}>
        <ListItemIcon sx={menuIconStyle}>
          <MonitorWeightIcon />
        </ListItemIcon>
        <ListItemText primary="Comida" />
      </ListItemButton>

      {/* PACIENTES */}
      <ListItemButton onClick={() => handleNavigate("/patients")}>
        <ListItemIcon sx={menuIconStyle}>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Pacientes" />
      </ListItemButton>

      {/* CITAS */}
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

      {/* CONTABILIDAD */}
      <ListItemButton onClick={() => handleNavigate("/accounting")}>
        <ListItemIcon sx={menuIconStyle}>
          <PaymentsIcon />
        </ListItemIcon>
        <ListItemText primary="Contabilidad" />
      </ListItemButton>

      {/* PRODUCTOS */}
      <ListItemButton onClick={() => setOpenProducts(!openProducts)}>
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
            <ListItemIcon sx={menuIconStyle}>
              <PointOfSaleIcon />
            </ListItemIcon>
            <ListItemText primary="Caja" />
          </ListItemButton>

          <ListItemButton
            sx={{ pl: 4 }}
            onClick={() => handleNavigate("/products/management")}
          >
            <ListItemIcon sx={menuIconStyle}>
              <Inventory2Icon />
            </ListItemIcon>
            <ListItemText primary="Gestión" />
          </ListItemButton>

          <ListItemButton
            sx={{ pl: 4 }}
            onClick={() => handleNavigate("/sales")}
          >
            <ListItemIcon sx={menuIconStyle}>
              <ReceiptLongIcon />
            </ListItemIcon>
            <ListItemText primary="Ventas" />
          </ListItemButton>
        </List>
      </Collapse>

      {/* LOGOUT */}
      <ListItemButton onClick={handleLogout}>
        <ListItemIcon sx={{ color: "error.main", minWidth: 40 }}>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Cerrar sesión" />
      </ListItemButton>
    </List>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* APPBAR */}
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <Box
            component="img"
            src={logo}
            alt="logo"
            sx={{
              height: 48,
              width: 48,
              borderRadius: "50%",
              ml: 1,
              objectFit: "cover",
            }}
          />
        </Toolbar>
      </AppBar>

      {/* DRAWER (SOLO UNO PARA TODO) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        {menuContent}
      </Drawer>

      {/* CONTENT */}
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