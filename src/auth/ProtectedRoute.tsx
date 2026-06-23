import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contex/AuthContext";


export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return null; // o un spinner

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}