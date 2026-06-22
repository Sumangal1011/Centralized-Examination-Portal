import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Timer, ShieldCheck, EyeOff, Mic, SmilePlus, AlertTriangle } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [incData, examData, subData] = await Promise.all([
          incidentAPI.list(),
          examAPI.list(),
          submissionAPI.list(),
        ]);
        setIncidents(incData);
        setExams(examData);
        setSubmissions(subData);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

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

  // Calculate stats
  const totalSubmissions = submissions.length;
  const activeExamsCount = exams.length;
  const avgScore = totalSubmissions > 0
    ? Math.round(submissions.reduce((acc, curr) => acc + curr.score, 0) / totalSubmissions)
    : 0;

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <p style={{ fontWeight: 600, color: 'var(--clr-neutral)' }}>Loading system dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <TopBar
        title="ExamAI"
        rightSlot={
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#64748b,#0f172a)', border: '2px solid var(--clr-border)' }} />
        }
      />

      <div className="page-content">
        <h1 style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700, marginBottom: 4 }}>System Overview</h1>
        <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)', marginBottom: 20 }}>
          Real-time examination analytics
        </p>

        {/* Stat cards */}
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

        {/* Violation Trends chart */}
        <ViolationChart />

        {/* Recent Incidents */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
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
