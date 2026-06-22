# ExamAI — Secure Examination Portal

ExamAI is a modern, web-based examination portal client designed to facilitate secure online testing and robust proctoring operations. Built with React and Vite, the platform provides candidate verification, assessment execution, and real-time proctor monitoring analytics.

---

## Key Features

### 1. Candidate Verification & Identity Check
* **Biometric Pre-Check Simulation**: Integrates a client-side face alignment guide and matching engine to verify candidates against institutional databases.
* **Confidence Scoring**: Dynamic confidence calculation to ensure exam session integrity before a candidate can proceed to the exam interface.

### 2. Examination Interface
* **Interactive Assessments**: Clean, distractions-free test-taking workspace displaying real-time timer metrics, interactive answer selections, and progress tracking.
* **State Management**: Prevents inadvertent loss of answers through persistent component states.

### 3. Incident Review & Proctoring Dashboard
* **Risk Evaluation Engine**: Computes candidate threat scores based on monitored behaviors (e.g., unauthorized window focus shifts, acoustic deviations, or presence of multiple people).
* **Granular Incident Timeline**: Displays structured logs showing exact timestamps and violation types (e.g., tab switches, microphone activity, visual anomalies).
* **Media Playback Simulation**: Mock interface for playing back video records with highlighted infraction segments.

### 4. Administrator Analytics & Audit Logs
* **Data Visualization**: Employs interactive chart modules powered by Recharts to display violation trends and incident metrics.
* **Comprehensive Audit Trail**: Lists administrator activities and candidate events sequentially for complete transparency and compliance.

---

## Tech Stack

* **Core Framework**: React 19 (Functional Components & Hooks)
* **Build System**: Vite 8 (Hot Module Replacement, optimized bundling)
* **Routing**: React Router DOM 7
* **Data Visualization**: Recharts 3
* **Icons**: Lucide React
* **Styling**: Pure CSS3 utilizing semantic Design Tokens (Custom Properties) for colors, spacing, typography, and responsive variables.

---

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* npm (v9.0.0 or higher)

### Installation

1. Clone this repository to your local environment.
2. Navigate to the project root directory:
   ```bash
   cd Client
   ```
3. Install the project dependencies:
   ```bash
   npm install
   ```

### Development Server

To launch the project in development mode with active HMR (Hot Module Replacement):

```bash
npm run dev
```

Once started, open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### Production Build

To compile and optimize the client application assets for production environments:

```bash
npm run build
```

The output assets will be generated in the `dist` directory. To test the build locally, run:

```bash
npm run preview
```

---

## Directory Structure

```text
Client/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and local media
│   ├── components/         # Reusable structural components
│   │   ├── BottomNav.jsx   # Layout footer navigation
│   │   ├── IncidentCard.jsx# Proctor incident summaries
│   │   ├── QuestionCard.jsx# Interactive exam question renderer
│   │   ├── StatCard.jsx    # Metric highlights
│   │   ├── TopBar.jsx      # Navigation header
│   │   └── ViolationChart.jsx # Recharts metric engine
│   ├── pages/              # Primary route views
│   │   ├── AnalysisPage.jsx
│   │   ├── AuditLogPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ExamPage.jsx
│   │   ├── IdentityCheckPage.jsx
│   │   ├── IncidentReviewPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── QuestionsPage.jsx
│   │   └── SettingsPage.jsx
│   ├── App.css             # Main stylesheet transitions
│   ├── index.css           # Global design tokens and animations
│   └── main.jsx            # React root entry point
├── eslint.config.js        # Linter configuration
├── index.html              # Core HTML structure
├── package.json            # Project manifest and scripts
└── vite.config.js          # Vite custom compiler rules
```

---

## Linting

To analyze the code files for common quality issues or style guidelines:

```bash
npm run lint
```
