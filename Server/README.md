# Examination Portal - Backend Server

## Overview

This is the backend server for the **AI-Powered Examination Portal**. It provides APIs for authentication, exam management, student submissions, automated evaluation, and AI-based proctoring incident tracking.

The server is built using:

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication

---

## Features

### Authentication & Authorization

* User Registration
* User Login
* JWT-Based Authentication
* Role-Based Access Control

  * Admin
  * Examiner
  * Student

### Exam Management

* Create Exam Papers
* Upload Questions
* Fetch Available Exams
* Manage Exam Details

### Submission Management

* Submit Student Answers
* Automatic Score Calculation
* Store Submission Records

### AI Proctoring & Monitoring

* Track Suspicious Activities
* Store Webcam Detection Logs
* Store Audio Violation Logs
* Record Proctoring Incidents

### Database Seeding

* Generate Sample Users
* Generate Sample Exams
* Generate Sample Incidents

---

## Project Structure

```text
Server/
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   ├── Exam.js
│   ├── Submission.js
│   └── Incident.js
├── routes/
│   ├── auth.js
│   ├── exam.js
│   ├── submission.js
│   └── incident.js
├── seeds/
│   └── seed.js
├── .env
├── package.json
└── server.js
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd Server
```

### Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the root of the Server directory.

```env
PORT=5000

MONGO_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_jwt_secret_key
```

---

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server will run on:

```text
http://localhost:5000
```

---

## API Endpoints

### Authentication

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | /api/auth/register | Register User |
| POST   | /api/auth/login    | Login User    |

---

### Exams

| Method | Endpoint      | Description       |
| ------ | ------------- | ----------------- |
| POST   | /api/exam     | Create Exam       |
| GET    | /api/exam     | Fetch All Exams   |
| GET    | /api/exam/:id | Fetch Single Exam |

---

### Submissions

| Method | Endpoint            | Description            |
| ------ | ------------------- | ---------------------- |
| POST   | /api/submission     | Submit Answers         |
| GET    | /api/submission/:id | Get Submission Details |

---

### Incidents

| Method | Endpoint      | Description                |
| ------ | ------------- | -------------------------- |
| POST   | /api/incident | Record Proctoring Incident |
| GET    | /api/incident | Fetch Incident Logs        |

---

## Database Models

### User

Stores authentication and role information.

Fields:

* Name
* Email
* Password
* Role

### Exam

Stores examination details.

Fields:

* Title
* Description
* Questions
* Duration

### Submission

Stores student responses and scores.

Fields:

* Student
* Exam
* Answers
* Score

### Incident

Stores AI proctoring logs.

Fields:

* Student
* Incident Type
* Timestamp
* Evidence

---

## Seed Database

Populate sample data:

```bash
node seeds/seed.js
```

This will generate:

* Sample Users
* Sample Exams
* Sample Submissions
* Sample Incidents

---

## Security Features

* JWT Authentication
* Password Hashing
* Protected Routes
* Role-Based Authorization
* Secure Environment Variables

---

## Future Enhancements

* AI-Based Face Detection
* Tab Switching Detection
* Voice Activity Monitoring
* Real-Time Proctor Dashboard
* Automated Exam Scheduling
* Analytics & Reporting

---

## Author

Final Year B.Tech Project

**AI-Powered Examination Portal with Automated Evaluation and Proctoring System**
