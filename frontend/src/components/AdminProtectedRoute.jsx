// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};