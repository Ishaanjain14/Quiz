import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const student = JSON.parse(sessionStorage.getItem("student"));
  return student ? children : <Navigate to="/" />;
};
