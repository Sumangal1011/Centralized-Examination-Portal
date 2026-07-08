import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Timer, ShieldCheck, EyeOff, Mic, SmilePlus, AlertTriangle, FileText } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import StatCard from '../components/StatCard';
import IncidentCard from '../components/IncidentCard';
import ViolationChart from '../components/ViolationChart';
import { incidentAPI, examAPI, submissionAPI } from '../utils/api';

const ICON_MAP = {
  tab_switch: EyeOff,
  multiple_persons: SmilePlus,
  audio: Mic,
  start: Timer,
  submit: ShieldCheck,
};

const BG_MAP = {
  tab_switch: 'var(--clr-high-bg)',
  multiple_persons: 'var(--clr-high-bg)',
  audio: 'var(--clr-low-bg)',
  start: 'var(--clr-ai-blue-bg)',
  submit: 'var(--clr-low-bg)',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (isStudent) {
          const [examData, subData] = await Promise.all([
            examAPI.list(),
            submissionAPI.getMySubmissions(),
          ]);
          setExams(examData);
          setMySubmissions(subData);
        } else {
          const [incData, examData, subData] = await Promise.all([
            incidentAPI.list(),
            examAPI.list(),
            submissionAPI.list(),
          ]);
          setIncidents(incData);
          setExams(examData);
          setSubmissions(subData);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [isStudent]);

  const getRiskString = (score) => {
    if (score >= 75) return 'HIGH RISK';
    if (score >= 40) return 'MEDIUM RISK';
    return 'LOW RISK';
  };

  const getIncidentIconInfo = (inc) => {
    const lastEvent = inc.timeline && inc.timeline.length > 0
      ? inc.timeline[inc.timeline.length - 1]
      : null;
    const type = lastEvent ? lastEvent.type : 'tab_switch';
    return {
      Icon: ICON_MAP[type] || AlertTriangle,
      bg: BG_MAP[type] || 'var(--clr-surface-low)',
      label: lastEvent ? lastEvent.label : 'Anomaly Detected',
    };
  };

  const hasSubmitted = (examId) => {
    return mySubmissions.some(sub => {
      const subExamId = sub.exam?._id || sub.exam;
      return subExamId === examId || subExamId?.toString() === examId?.toString();
    });
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <p style={{ fontWeight: 600, color: 'var(--clr-neutral)' }}>Loading dashboard panel...</p>
      </div>
    );
  }

  // Calculate stats for Examiners/Admins
  const totalSubmissions = submissions.length;
  const activeExamsCount = exams.length;
  const avgScore = totalSubmissions > 0
    ? Math.round(submissions.reduce((acc, curr) => acc + curr.score, 0) / totalSubmissions)
    : 0;

  // ─── Student View ──────────────────────────────────────────────────────────
  if (isStudent) {
    return (
      <div className="page-wrapper">
        <TopBar
          title="Student Dashboard"
          rightSlot={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)', fontWeight: 600 }}>{user.name}</span>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#0f172a)', border: '2px solid var(--clr-border)' }} />
            </div>
          }
        />

        <div className="page-content" style={{ paddingBottom: 110 }}>
          {/* Welcome card */}
          <div className="card fade-in" style={{ marginBottom: 24, background: 'linear-gradient(135deg, var(--clr-surface-low), var(--clr-surface-high))' }}>
            <h2 style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700, marginBottom: 4 }}>Welcome, {user.name}!</h2>
            <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)' }}>University ID: {user.uid} · Role: Candidate</p>
          </div>

          {/* Available exams */}
          <h2 style={{ fontSize: 'var(--fs-headline-md)', fontWeight: 700, marginBottom: 14 }}>Available Assessments</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
            {exams.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--clr-neutral)', padding: 20 }}>
                No active exams released yet.
              </div>
            ) : (
              exams.map(exam => {
                const submitted = hasSubmitted(exam._id);
                return (
                  <div key={exam._id} className="card fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                    <div>
                      <span className="chip chip-ai" style={{ marginBottom: 6 }}>{exam.subject}</span>
                      <h3 style={{ fontSize: 'var(--fs-body-md)', fontWeight: 700 }}>{exam.title}</h3>
                      <p style={{ color: 'var(--clr-neutral)', fontSize: 12, marginTop: 4 }}>Duration: {exam.duration} mins · {exam.questions?.length || 0} Qs</p>
                    </div>
                    {submitted ? (
                      <span className="chip chip-low" style={{ fontWeight: 700 }}>Submitted</span>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ width: 'auto', height: 38, padding: '0 16px', fontSize: 12 }}
                        onClick={() => {
                          localStorage.setItem('selectedExamId', exam._id);
                          navigate('/exam-select');
                        }}
                      >
                        Start →
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Past Submissions & Review */}
          <h2 style={{ fontSize: 'var(--fs-headline-md)', fontWeight: 700, marginBottom: 14 }}>Your Submissions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mySubmissions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--clr-neutral)', padding: 20 }}>
                No exam history found.
              </div>
            ) : (
              mySubmissions.map(sub => (
                <div key={sub._id} className="card fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                  <div>
                    <span className="chip chip-low" style={{ marginBottom: 6 }}>{sub.exam?.subject || 'Assessment'}</span>
                    <h3 style={{ fontSize: 'var(--fs-body-md)', fontWeight: 700 }}>{sub.exam?.title || 'Unknown Exam'}</h3>
                    <p style={{ color: 'var(--clr-neutral)', fontSize: 12, marginTop: 4 }}>
                      Score: <span style={{ color: 'var(--clr-brand)', fontWeight: 700 }}>{sub.score} pts</span> · Status: {sub.status}
                    </p>
                  </div>
                  <button
                    className="btn btn-secondary"
                    style={{ width: 'auto', height: 38, padding: '0 16px', fontSize: 12 }}
                    onClick={() => navigate(`/review/${sub.exam?._id || sub.exam}`)}
                  >
                    Review Answers
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ─── Examiner / Admin View ─────────────────────────────────────────────────
  return (
    <div className="page-wrapper">
      <TopBar
        title="ExamAI"
        rightSlot={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)', fontWeight: 600 }}>{user.name}</span>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#0f172a)', border: '2px solid var(--clr-border)' }} />
          </div>
        }
      />

      <div className="page-content">
        <h1 style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700, marginBottom: 4 }}>System Overview</h1>
        <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)', marginBottom: 20 }}>
          Real-time examination analytics
        </p>

        {/* Admin Configuration Shortcuts */}
        {isAdmin && (
          <div className="card fade-in" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--clr-surface-low)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 700, marginBottom: 2 }}>User Registry Controls</h3>
              <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-sm)' }}>Add students or examiner accounts directly.</p>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: 'auto', height: 40, padding: '0 18px', fontSize: 12 }}
              onClick={() => navigate('/admin/users')}
            >
              + Create User
            </button>
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          <StatCard
            label="Total Submissions"
            value={totalSubmissions.toString()}
            sub="Graded assessments"
            subColor="var(--clr-low)"
            icon={Users}
          />
          <StatCard
            label="Active Papers"
            value={activeExamsCount.toString()}
            sub="Across available courses"
            icon={Timer}
          />
          <StatCard
            label="Avg Score"
            value={`${avgScore} pts`}
            icon={ShieldCheck}
          />
        </div>

        {/* Exams with submission counts — Examiner view */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 700, marginBottom: 14 }}>
            Exam Papers & Submissions
          </h2>
          {exams.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--clr-neutral)', padding: 20 }}>
              No exam papers found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {exams.map(exam => {
                const examSubCount = submissions.filter(sub => {
                  const subExamId = sub.exam?._id || sub.exam;
                  return subExamId === exam._id || subExamId?.toString() === exam._id?.toString();
                }).length;

                return (
                  <div key={exam._id} className="card fade-in" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ flex: 1 }}>
                      <span className="chip chip-ai" style={{ marginBottom: 6, fontSize: 10 }}>{exam.subject}</span>
                      <h3 style={{ fontSize: 'var(--fs-body-md)', fontWeight: 700, marginBottom: 2 }}>{exam.title}</h3>
                      <p style={{ color: 'var(--clr-neutral)', fontSize: 12 }}>
                        {exam.duration} mins · {exam.questions?.length || 0} Qs ·{' '}
                        <span style={{ color: 'var(--clr-brand)', fontWeight: 600 }}>{examSubCount} submitted</span>
                      </p>
                    </div>
                    <button
                      className="btn btn-secondary"
                      style={{ width: 'auto', height: 36, padding: '0 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={() => navigate(`/exam-submissions/${exam._id}`)}
                    >
                      <FileText size={14} /> View Submissions
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Violation Trends chart */}
        <ViolationChart />

        {/* Recent Incidents */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 24 }}>
          <h2 style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 700 }}>Recent Incidents ({incidents.length})</h2>
          <button
            onClick={() => navigate('/analysis')}
            style={{ fontSize: 'var(--fs-label-md)', color: 'var(--clr-neutral)', fontWeight: 500 }}
          >
            View Alerts
          </button>
        </div>

        {incidents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--clr-neutral)' }}>
            ✓ No violations or cheating incidents detected.
          </div>
        ) : (
          incidents.slice(0, 5).map((inc) => {
            const { Icon, bg, label } = getIncidentIconInfo(inc);
            return (
              <IncidentCard
                key={inc._id}
                icon={Icon}
                iconBg={bg}
                title={label}
                sub={`Student: ${inc.student ? inc.student.name : 'Unknown'} (${inc.student ? inc.student.uid : 'N/A'})`}
                risk={getRiskString(inc.riskScore)}
                onClick={() => navigate(`/incident/${inc.caseNumber}`)}
              />
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
