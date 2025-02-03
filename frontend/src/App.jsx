
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {InstructionsPage} from "./components/Instructions";
import {ExamInterface} from "./components/ExamInterface";
import {UploadExcel} from "./components/UploadExcel";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InstructionsPage />} />
        <Route path="/exam" element={<ExamInterface />} />
        <Route path='/upload' element={<UploadExcel />} />
      </Routes>
    </Router>
  );
}

export default App;
