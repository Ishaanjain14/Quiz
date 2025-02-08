const path = require("path");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const XLSX = require("xlsx");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3002;
const UPLOADS_DIR = "uploads";
const QUESTIONS_FILE = path.join(__dirname, "frontend", "public", "questions.json");
const RESULTS_FILE = path.join(__dirname, "results.xlsx");
const STUDENTS_FILE = path.join(__dirname, "students.json");

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "frontend", "dist")));

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// File upload configuration
const upload = multer({ dest: UPLOADS_DIR });

/* ===========================
       Utility Functions
=========================== */
const readJSONFile = (filePath, defaultValue = []) => {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  return defaultValue;
};

const writeJSONFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Load student data
const getStudents = () => readJSONFile(STUDENTS_FILE);

/* ===========================
       Authentication
=========================== */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const students = getStudents();

  const student = students.find((s) => s.Email === email && String(s["Roll Number"]) === password);
  if (student) {
    return res.json({ success: true, student });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

/* ===========================
      Question Management
=========================== */
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    const formattedData = rawData.map((row, index) => ({
      id: index + 1,
      subject: row.subject,
      question: row.question,
      options: [row.option_1, row.option_2, row.option_3, row.option_4].filter(Boolean),
      marks: row.marks || 1,
      correctAnswer: row.answer,
    }));

    writeJSONFile(QUESTIONS_FILE, formattedData);
    io.emit("data-updated", { message: "Questions updated!" });

    fs.unlink(req.file.path, () => {}); // Non-blocking delete
    res.json({ message: "File uploaded and questions saved successfully." });
  } catch (error) {
    res.status(500).json({ error: "Error processing file", details: error.message });
  }
});

app.get("/api/questions", (req, res) => {
  const questions = readJSONFile(QUESTIONS_FILE, []);
  if (!questions.length) return res.status(404).json({ error: "No questions available" });

  res.json(questions);
});

/* ===========================
        Exam Submission
=========================== */
app.post("/submit", (req, res) => {
  const { studentName, responses } = req.body;
  if (!studentName || !responses) return res.status(400).json({ error: "Missing student name or responses" });

  const questions = readJSONFile(QUESTIONS_FILE, []);
  let score = 0;

  questions.forEach((question, index) => {
    if (responses[index] === question.correctAnswer) {
      score += question.marks || 1;
    }
  });

  saveResult(studentName, score);
  io.emit("result-updated", { studentName, score });

  res.json({ message: "Exam submitted successfully!", score });
});

/* ===========================
      Result Management
=========================== */
const saveResult = (studentName, score) => {
  let results = readJSONFile(RESULTS_FILE, []);

  results.push({ Student: studentName, Score: score });

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(results);
  XLSX.utils.book_append_sheet(workbook, sheet, "Results");
  XLSX.writeFile(workbook, RESULTS_FILE);
};

app.get("/result", (req, res) => {
  if (!fs.existsSync(RESULTS_FILE)) return res.status(404).json({ error: "No results available" });

  const workbook = XLSX.readFile(RESULTS_FILE);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const results = XLSX.utils.sheet_to_json(sheet);

  res.json(results);
});

/* ===========================
      Student Management
=========================== */
app.post("/upload-students", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const studentsData = XLSX.utils.sheet_to_json(sheet);

    writeJSONFile(STUDENTS_FILE, studentsData);
    io.emit("students-updated", { message: "Student list updated!" });

    fs.unlink(req.file.path, () => {});
    res.json({ message: "Student list uploaded successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error processing file", details: error.message });
  }
});

app.get("/api/students", (req, res) => {
  const students = readJSONFile(STUDENTS_FILE, []);
  if (!students.length) return res.status(404).json({ error: "No student data available" });

  res.json(students);
});

/* ===========================
        Socket.io Setup
=========================== */
io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
});

/* ===========================
        Serve React App
=========================== */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

/* ===========================
      Start Server
=========================== */
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
