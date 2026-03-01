# 📝 QuizCraft — Online Examination Platform

A full-stack online quiz/examination platform built with **Express.js** and **React**. Designed for institutions to conduct secure, timed exams with an admin panel and real-time monitoring.

---

## ✨ Features

### 👨‍🎓 Student Side
- **Secure Login** — Email + Roll Number authentication
- **Timed Exams** — Auto-submit when time runs out
- **Section-wise Navigation** — Move between subjects with "Save & Next Section"
- **Question Navigator** — Track attempted, unattempted, and marked-for-review questions
- **Anti-Cheating** — Fullscreen enforcement, tab-switch detection, suspicious activity flagging
- **One Attempt Only** — Students cannot re-attempt after submission

### 👨‍💼 Admin Side
- **Upload Questions** — Import from Excel (.xlsx) using a template
- **Upload Students** — Bulk import student list from Excel
- **Set Schedule** — Configure exam date, start time, and end time
- **Download Results** — Export results as Excel after the test ends
- **Download Templates** — Get blank Excel templates for questions and students

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router, Vite |
| **Backend** | Express.js, Node.js |
| **Real-time** | Socket.io |
| **File Processing** | Multer, xlsx |
| **Styling** | Custom CSS with Inter font |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/Ishaanjain14/Quiz.git
cd Quiz

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Run Locally

```bash
npm start
```

This builds the frontend and starts the server at **http://localhost:3002**

---

## 📁 Project Structure

```
Quiz/
├── app.js                  # Express backend (API routes)
├── vercel.json             # Vercel deployment config
├── students.json           # Student data
├── schedule.json           # Exam schedule
├── templates/              # Excel templates for download
├── uploads/                # Uploaded files
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Router & routes
│   │   ├── index.css       # Global design system
│   │   └── components/
│   │       ├── loginpage.jsx       # Student login
│   │       ├── adminLogin.jsx      # Admin login
│   │       ├── Instructions.jsx    # Exam instructions
│   │       ├── ExamInterface.jsx   # Exam with timer & navigator
│   │       ├── UploadExcel.jsx     # Admin dashboard
│   │       └── Result.jsx          # Submission result
│   └── dist/               # Production build (auto-generated)
└── package.json
```

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@example.com | admin123 |
| **Student** | *(uploaded via Excel)* | Roll Number |

---

## 📋 Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Student Login |
| `/admin` | Public | Admin Login |
| `/upload` | Admin | Dashboard — upload questions, students, set schedule |
| `/instructions` | Student | Read exam instructions before starting |
| `/exam` | Student | Take the exam |

---

## 📦 Deployment

Configured for **Vercel** deployment with `vercel.json`. See deployment steps in the Vercel dashboard.

---

## 📄 License

ISC
