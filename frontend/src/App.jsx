
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {InstructionsPage} from "./components/Instructions";
import {ExamInterface} from "./components/ExamInterface";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InstructionsPage />} />
        <Route path="/exam" element={<ExamInterface />} />
      </Routes>
    </Router>
  );
}

export default App;
