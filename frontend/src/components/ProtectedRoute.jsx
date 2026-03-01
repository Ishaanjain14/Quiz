import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const student = JSON.parse(localStorage.getItem("student"));
  return student ? children : <Navigate to="/" />;
};
