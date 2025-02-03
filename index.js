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

// Middleware for JSON parsing and handling CORS
app.use(express.json());
app.use(cors());

// Configure Multer for file uploads (store files in 'uploads' folder)
const upload = multer({ dest: "uploads/" });

// Serve static files from React build directory
app.use(express.static(path.join(__dirname, "frontend", "dist")));

// API Endpoint to handle Excel file upload and convert it to JSON
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const fileSize = req.file.size; // Get the file size to track progress
  let uploaded = 0;

  // Emit the start of the file upload progress
  io.emit("upload-progress", { progress: 0 });

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Assume first sheet
    const sheet = workbook.Sheets[sheetName];

    // Parse the sheet into JSON
    const rawData = XLSX.utils.sheet_to_json(sheet);
    const formattedData = rawData.map((row) => ({
      id: row.id,
      subject: row.subject,
      question: row.question,
      options: [row.option_1, row.option_2, row.option_3, row.option_4],
      marks:row.marks,
      correctAnswer: row.answer,
    }));

    // Define JSON file path in frontend/public (accessible by frontend)
    const jsonFilePath = path.join(__dirname, "frontend", "public", "questions.json");

    // Store JSON file
    fs.writeFileSync(jsonFilePath, JSON.stringify(formattedData, null, 2));

    // Emit event to frontend that data has been updated
    io.emit("data-updated", { message: "Data updated!" });

    // Cleanup: Delete the original Excel file
    fs.unlinkSync(filePath);

    res.json({ message: "File uploaded and saved as questions.json" });
  } catch (error) {
    res.status(500).json({ error: "Error processing file", details: error.message });
  }
});

// Listen for WebSocket connections
io.on("connection", (socket) => {
  console.log("New client connected");

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Serve the React app for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// Start the server
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
