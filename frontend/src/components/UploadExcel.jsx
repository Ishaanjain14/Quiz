import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./upload.css";

const socket = io("http://localhost:3002");

export const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [studentFile, setStudentFile] = useState(null);
  const [message, setMessage] = useState("");
  const [studentMessage, setStudentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");

  // Handle file selection
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleStudentFileChange = (e) => setStudentFile(e.target.files[0]);

  // Upload Questions Excel
  const handleUpload = (file, endpoint, setMessage) => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    fetch(`http://localhost:3002/${endpoint}`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Failed to upload file."))
      .finally(() => setLoading(false));
  };

  // Download Excel Template
  const handleDownload = (filename) => {
    const fileUrl = `/${filename}`;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Listen for data updates
  useEffect(() => {
    socket.on("data-updated", (data) => setNotification(data.message));
    socket.on("students-updated", (data) => setNotification(data.message));

    return () => {
      socket.off("data-updated");
      socket.off("students-updated");
    };
  }, []);

  return (
    <div>
      <h1>Upload Excel Files</h1>

      {/* Upload Questions */}
      <h2>Upload Questions File</h2>
      <input type="file" onChange={handleFileChange} disabled={loading} />
      <button onClick={() => handleUpload(file, "upload", setMessage)} disabled={loading}>
        {loading ? "Uploading..." : "Upload Questions"}
      </button>
      <p>{message}</p>

      {/* Upload Student List */}
      <h2>Upload Student List</h2>
      <input type="file" onChange={handleStudentFileChange} disabled={loading} />
      <button onClick={() => handleUpload(studentFile, "upload-students", setStudentMessage)} disabled={loading}>
        {loading ? "Uploading..." : "Upload Students"}
      </button>
      <p>{studentMessage}</p>

      {notification && <div className="notification">{notification}</div>}

      {/* Download Templates */}
      <h2>Download Templates</h2>
      <button onClick={() => handleDownload("question_template.xlsx")}>Download Question Template</button>
      <button onClick={() => handleDownload("student_template.xlsx")}>Download Student Template</button>
    </div>
  );
};
