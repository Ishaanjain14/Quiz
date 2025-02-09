const path = require("path");
const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3002;
const UPLOADS_DIR = "uploads";
const QUESTIONS_FILE = path.join(__dirname, "frontend", "public", "questions.json");
const RESULTS_FILE = path.join(__dirname, "results.json");
const STUDENTS_FILE = path.join(__dirname, "students.json");

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://yourfrontend.com" })); // Restrict CORS in production
app.use(express.static(path.join(__dirname, "frontend", "dist")));

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

const upload = multer({ dest: UPLOADS_DIR });

/* ===========================
       Utility Functions
=========================== */
const readJSONFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    console.error(`Error reading JSON file (${filePath}):`, error);
    return [];
  }
};

const writeJSONFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const saveResultToJSON = (studentName, rollNumber, score) => {
  let results = readJSONFile(RESULTS_FILE);
  results.push({ Student: studentName, RollNumber: rollNumber, Score: score });
  writeJSONFile(RESULTS_FILE, results);
};

/* ===========================
       Authentication
=========================== */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const students = readJSONFile(STUDENTS_FILE);

  const student = students.find(
    (s) => s.Email === email && String(s["Roll Number"]) === password
  );

  if (student) return res.json({ success: true, student });
  res.status(401).json({ success: false, message: "Invalid credentials" });
});

/* ===========================
      Question Management
=========================== */
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet);
    
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
    
    fs.unlink(req.file.path, (err) => { if (err) console.error("File delete error:", err); });
    res.json({ message: "File uploaded and questions saved successfully." });
  } catch (error) {
    res.status(500).json({ error: "Error processing file", details: error.message });
  }
});

app.get("/api/questions", (req, res) => {
  const questions = readJSONFile(QUESTIONS_FILE);
  if (!questions.length) return res.status(404).json({ error: "No questions available" });
  res.json(questions);
});

/* ===========================
        Exam Submission
=========================== */
app.post("/submit", (req, res) => {
  const { studentName, rollNumber, responses } = req.body;
  if (!studentName || !rollNumber || !responses) return res.status(400).json({ error: "Missing details" });
  
  const questions = readJSONFile(QUESTIONS_FILE);
  let totalScore = 0;

  questions.forEach((q) => {
    if (responses[q.id] && responses[q.id].trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
      totalScore += q.marks || 1;
    }
  });

  saveResultToJSON(studentName, rollNumber, totalScore);
  io.emit("result-updated", { studentName, rollNumber, totalScore });
  res.json({ message: "Exam submitted successfully!", score: totalScore });
});

/* ===========================
      Student Management
=========================== */
app.post("/upload-students", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    writeJSONFile(STUDENTS_FILE, xlsx.utils.sheet_to_json(sheet));
    io.emit("students-updated", { message: "Student list updated!" });
    fs.unlink(req.file.path, () => {});
    res.json({ message: "Student list uploaded successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error processing file", details: error.message });
  }
});

app.get("/api/students", (req, res) => {
  const students = readJSONFile(STUDENTS_FILE);
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
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

/* ===========================
      Start Server
=========================== */
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
