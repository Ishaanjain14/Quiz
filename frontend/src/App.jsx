import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { InstructionsPage } from "./components/Instructions";
import { ExamInterface } from "./components/ExamInterface";
import { LoginPage } from "./components/loginpage";
import { UploadExcel } from "./components/UploadExcel";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  useEffect(() => {
    const enableFullscreen = async () => {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (err) {
          console.error("Error enabling fullscreen:", err);
        }
      }
    };

    enableFullscreen();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/instructions" element={<ProtectedRoute><InstructionsPage /></ProtectedRoute>} />
        <Route path="/exam" element={<ProtectedRoute><ExamInterface /></ProtectedRoute>} />
        <Route path="/upload" element={<UploadExcel />} />
      </Routes>
    </Router>
  );
}

export default App;
