import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage          from './pages/LoginPage';
import IdentityCheckPage  from './pages/IdentityCheckPage';
import ExamPage           from './pages/ExamPage';
import DashboardPage      from './pages/DashboardPage';
import QuestionsPage      from './pages/QuestionsPage';
import IncidentReviewPage from './pages/IncidentReviewPage';
import AnalysisPage       from './pages/AnalysisPage';
import AuditLogPage       from './pages/AuditLogPage';
import SettingsPage       from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<LoginPage />} />
        <Route path="/verify"     element={<IdentityCheckPage />} />
        <Route path="/exam"       element={<ExamPage />} />
        <Route path="/dashboard"  element={<DashboardPage />} />
        <Route path="/questions"  element={<QuestionsPage />} />
        <Route path="/incident/:id" element={<IncidentReviewPage />} />
        <Route path="/analysis"   element={<AnalysisPage />} />
        <Route path="/audit"      element={<AuditLogPage />} />
        <Route path="/settings"   element={<SettingsPage />} />
        {/* Catch-all */}
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
