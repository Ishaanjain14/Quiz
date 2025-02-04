import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./upload.css"
const socket = io("http://localhost:3002"); // Connect to your backend server

export const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notification, setNotification] = useState(""); // New state for notifications

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setUploadProgress(0);
  };

  // Handle file upload with progress monitoring
  const handleUpload = () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    // Monitor upload progress
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        setUploadProgress(percent);
      }
    });

    // Handle upload completion or error
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          setMessage("File uploaded successfully!");
        } else {
          setMessage("Failed to upload file.");
        }
        setLoading(false);
      }
    };

    // Open the request and send it
    xhr.open("POST", "http://localhost:3002/upload", true);
    xhr.send(formData);
  };

  // Handle download of the pre-existing file
  const handleDownload = () => {
    const fileUrl = "/question_template.xlsx"; // Path to the file inside your public folder
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = "question_template.xlsx"; // The name for the downloaded file
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Listen for the "data-updated" event from the server
  useEffect(() => {
    socket.on("data-updated", (data) => {
      setNotification(data.message); // Show the notification when data is updated
    });

    // Clean up the socket listener on component unmount
    return () => {
      socket.off("data-updated");
    };
  }, []);

  return (
    <div>
      <h1>Upload Excel File</h1>
      
      <input 
        type="file" 
        onChange={handleFileChange} 
        disabled={loading} 
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      {loading && (
        <div>
          <p>Upload Progress: {Math.round(uploadProgress)}%</p>
        </div>
      )}

      <p>{message}</p>

      {notification && <div className="notification">{notification}</div>}

      <h2>Download Provided Excel File</h2>
      <button onClick={handleDownload}>Download Excel File</button>
    </div>
  );
};
