import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Appointments from "./pages/AppointmentsPage";
import Login from "./login/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import Register from "./login/Register";
import AppointmentTypesSettings from "./pages/AppointmentTypesSettings";
import Products from "./pages/products/Products";
import ProductsManagement from "./pages/products/ProductsManagement";
import Sales from "./pages/products/Sales";
import Accounting from "./pages/products/Accounting";
import WorkScheduleSettings from "./pages/WorkScheduleSettings";
import FoodProductsManagement from "./FoodDateTable/FoodProductsManagement";
import PatientDietCreator from "./FoodDateTable/PatientNutritionCalculation";
import PatientDietGenerator from "./FoodDateTable/PatientDietGenerator";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔒 PRIVATE */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/foodDataTable" element={<FoodProductsManagement />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/settings/work-schedule" element={<WorkScheduleSettings  />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/management" element={<ProductsManagement />} />
            <Route path="/sales" element={<Sales />} />
              <Route path="/accounting" element={<Accounting />} />
            <Route path="/settings/appointment-types" element={<AppointmentTypesSettings />}/>
            <Route path="/patients/:id/diet" element={<PatientDietCreator />}/>
            <Route path="/patients/:id/diet/generate" element={<PatientDietGenerator />}
          />

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}