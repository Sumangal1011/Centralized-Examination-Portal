# ExamAI – AI-Powered Secure Examination Portal

## Overview

ExamAI is a full-stack web-based examination platform designed to conduct secure online assessments with integrated AI-assisted proctoring, automated evaluation, role-based access control, and real-time incident monitoring.

The system consists of:

* **Client Application** – React + Vite frontend for students, examiners, and administrators.
* **Server Application** – Node.js + Express backend with MongoDB Atlas integration.
* **AI Proctoring Module** – Tracks suspicious activities such as tab switching, multiple-person detection, audio violations, and other examination anomalies.

This project was developed as a **B.Tech Final Year Project** to demonstrate modern examination management and remote proctoring technologies.

---

## Features

### Student Features

* Secure Login & Authentication
* Identity Verification
* Online Exam Participation
* Real-Time Exam Timer
* Automatic Answer Submission
* Score Generation
* Incident Monitoring During Examination

### Examiner Features

* Create & Manage Examinations
* Review Student Submissions
* Monitor Proctoring Incidents
* Analyze Candidate Risk Scores
* Resolve or Escalate Violations

### Administrator Features

* User Management
* Audit Log Tracking
* System Analytics Dashboard
* Examination Oversight
* Security Monitoring

### AI Proctoring Features

* Tab Switch Detection
* Browser Visibility Monitoring
* Webcam Monitoring Framework
* Audio Activity Monitoring Framework
* Risk Score Calculation
* Incident Timeline Generation

---

## Technology Stack

### Frontend

* React 19
* Vite 8
* React Router DOM 7
* Recharts
* Lucide React
* CSS3

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* bcryptjs

### Development Tools

* ESLint
* Nodemon
* Git & GitHub

---

## Project Architecture

```text
examination_portal/
│
├── Client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── Server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seeds/
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## System Workflow

### Step 1: Authentication

Users log in using their assigned credentials.

Roles supported:

* Student
* Examiner
* Administrator

JWT tokens are generated and used for secure API communication.

---

### Step 2: Identity Verification

Before entering the examination environment:

* Candidate verification is performed.
* Identity confidence score is generated.
* Unauthorized users are blocked.

---

### Step 3: Examination Process

Students can:

* View available exams
* Answer questions
* Track remaining time
* Submit responses

The backend automatically stores and evaluates responses.

---

### Step 4: Proctoring Monitoring

During the examination:

* Browser tab changes are monitored.
* Incidents are logged.
* Risk scores are updated.
* Violations are visible to examiners in real time.

---

### Step 5: Evaluation & Reporting

After submission:

* Scores are calculated automatically.
* Results are stored.
* Audit logs are generated.
* Administrative dashboards display analytics.

---

## Installation Guide

### Clone Repository

```bash
git clone https://github.com/your-username/examination_portal.git
cd examination_portal
```

---

## Backend Setup

Navigate to the server directory:

```bash
cd Server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_secret_key
```

Start backend:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

---

## Frontend Setup

Navigate to the client directory:

```bash
cd Client
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Database Seeding

Populate sample data:

```bash
cd Server
npm run seed
```

Demo Accounts:

| Role     | User ID    | Password    |
| -------- | ---------- | ----------- |
| Student  | L-12345678 | student123  |
| Examiner | E-98765432 | examiner123 |
| Admin    | A-11112222 | admin123    |

---

## API Modules

### Authentication API

* User Registration
* Login
* JWT Generation

### Exam API

* Create Exam
* Fetch Exams
* Manage Questions

### Submission API

* Submit Answers
* Auto Evaluation
* Score Tracking

### Incident API

* Record Violations
* Fetch Incident Logs
* Risk Assessment

---

## Security Features

* JWT Authentication
* Password Hashing (bcryptjs)
* Protected Routes
* Role-Based Authorization
* Secure Environment Variables
* Incident Logging

---

## Future Enhancements

* Real-Time Face Recognition
* AI-Based Cheating Detection
* Voice Analysis
* Browser Lockdown Mode
* Live Proctor Dashboard
* Machine Learning Risk Prediction
* Email & SMS Notifications
* Certificate Generation

---

## Academic Relevance

This project demonstrates:

* Full-Stack Web Development
* Database Management
* Authentication & Security
* REST API Development
* AI-Based Proctoring Concepts
* Real-Time Monitoring Systems
* Modern Frontend Architecture

Suitable for:

* B.Tech Final Year Project
* MCA Major Project
* Software Engineering Demonstration
* Academic Research Prototype

---

## Author

**Sumangal Kayal**

B.Tech Final Year Project

### ExamAI – AI-Powered Secure Examination Portal
