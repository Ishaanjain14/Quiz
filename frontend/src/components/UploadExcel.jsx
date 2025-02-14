import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./upload.css";

const socket = io("http://localhost:3002");

export const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [studentFile, setStudentFile] = useState(null);
  const [message, setMessage] = useState("");
  const [studentMessage, setStudentMessage] = useState("");
  const [testDate, setTestDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [scheduleMessage, setScheduleMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTestOver, setIsTestOver] = useState(false);

  // Handle file selection
  const handleFileChange = (event, setFileFunction) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFileFunction(selectedFile);
    }
  };

  // Generic function for uploading files
  const handleUpload = async (file, endpoint, setFeedback) => {
    if (!file) {
      setFeedback("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3002/${endpoint}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setFeedback(data.message || "Upload successful!");
    } catch (error) {
      setFeedback("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Set test schedule
  const handleSetSchedule = async () => {
    if (!testDate || !startTime || !endTime) {
      setScheduleMessage("Please fill in all schedule fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3002/set-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testDate, startTime, endTime }),
      });
      const data = await response.json();
      setScheduleMessage(data.message || "Schedule set successfully!");
      socket.emit("schedule-updated");
    } catch (error) {
      setScheduleMessage("Failed to set schedule. Please try again.");
    }
  };

  // Check if the test has ended
  useEffect(() => {
    const checkTestStatus = () => {
      if (testDate && endTime) {
        const endDateTime = new Date(`${testDate}T${endTime}`);
        const now = new Date();
        setIsTestOver(now >= endDateTime);
      }
    };

    checkTestStatus();
    const interval = setInterval(checkTestStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [testDate, endTime]);

  // Download template files
  const handleDownload = async (filename) => {
    try {
      const response = await fetch(`http://localhost:3002/download/${filename}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      alert("Failed to download template. Please try again.");
    }
  };

  return (
    <div className="upload-container">
      <h1>Upload Excel Files</h1>

      {/* Upload Questions */}
      <section className="upload-section">
        <h2>Upload Questions File</h2>
        <input type="file" onChange={(e) => handleFileChange(e, setFile)} disabled={loading} />
        <button onClick={() => handleUpload(file, "upload", setMessage)} disabled={loading}>
          {loading ? "Uploading..." : "Upload Questions"}
        </button>
        <p className="feedback-message">{message}</p>
      </section>

      {/* Upload Student List */}
      <section className="upload-section">
        <h2>Upload Student List</h2>
        <input type="file" onChange={(e) => handleFileChange(e, setStudentFile)} disabled={loading} />
        <button onClick={() => handleUpload(studentFile, "upload-students", setStudentMessage)} disabled={loading}>
          {loading ? "Uploading..." : "Upload Students"}
        </button>
        <p className="feedback-message">{studentMessage}</p>
      </section>

      {/* Set Test Schedule */}
      <section className="schedule-section">
        <h2>Set Test Schedule</h2>
        <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        <button onClick={handleSetSchedule}>Set Schedule</button>
        <p className="feedback-message">{scheduleMessage}</p>
      </section>

      {/* Download Templates */}
      <section className="download-section">
        <h2>Download Templates</h2>
        <button onClick={() => handleDownload("question_template.xlsx")}>Download Question Template</button>
        <button onClick={() => handleDownload("student_template.xlsx")}>Download Student Template</button>
      </section>

      {/* Download Results */}
      <section className="download-section">
        <h2>Download Test Results</h2>
        <button
          onClick={() => handleDownload("results.json")}
          disabled={!isTestOver}
        >
          {isTestOver ? "Download Results" : "Test Not Completed Yet"}
        </button>
        {!isTestOver && <p className="feedback-message">You can download results only after the test is over.</p>}
      </section>
    </div>
  );
};
