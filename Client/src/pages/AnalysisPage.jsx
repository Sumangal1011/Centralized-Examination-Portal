import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Eye, Sparkles, Info, ChevronRight } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { incidentAPI } from '../utils/api';

const ICON_MAP = {
  tab_switch: Eye,
  multiple_persons: AlertTriangle,
  audio: AlertTriangle,
};

const BG_MAP = {
  tab_switch: 'var(--clr-ai-blue-bg)',
  multiple_persons: 'var(--clr-high-bg)',
  audio: 'var(--clr-medium-bg)',
};

const COLOR_MAP = {
  tab_switch: 'var(--clr-ai-blue)',
  multiple_persons: 'var(--clr-high)',
  audio: 'var(--clr-medium)',
};

export default function AnalysisPage() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await incidentAPI.list();
        setIncidents(data);
      } catch (err) {
        console.error('Failed to load integrity analysis:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  const getRiskString = (score) => {
    if (score >= 75) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  // Calculate dynamic stats
  const totalViolations = incidents.reduce((acc, curr) => acc + (curr.timeline?.length || 0), 0);
  const avgRisk = incidents.length > 0
    ? incidents.reduce((acc, curr) => acc + curr.riskScore, 0) / incidents.length
    : 0;
  const integrityScore = Math.max(0, (100 - avgRisk)).toFixed(1);

  // Group high risk incidents as alerts
  const highRiskIncidents = incidents.filter(i => i.riskScore >= 40);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <p style={{ fontWeight: 600, color: 'var(--clr-neutral)' }}>Loading integrity audits...</p>
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

      <div className="page-content" style={{ paddingBottom: 110 }}>
        <h1 style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700, marginBottom: 4 }}>System Audit</h1>
        <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)', marginBottom: 20 }}>
          Real-time departmental performance &amp; integrity metrics.
        </p>

        {/* Top metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div className="card" style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)', fontWeight: 500, marginBottom: 6 }}>Integrity Index</div>
            <div style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700 }}>
              {integrityScore}%
              <span style={{ fontSize: 12, color: 'var(--clr-low)', fontWeight: 600 }}> ↑</span>
            </div>
          </div>
          <div className="card" style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)', fontWeight: 500, marginBottom: 6 }}>Total Flags</div>
            <div style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700, color: 'var(--clr-high)' }}>
              {totalViolations}
              <span style={{ fontSize: 12, color: 'var(--clr-high)', fontWeight: 600 }}> ⚠</span>
            </div>
          </div>
        </div>

        {/* Pass rates by department */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 700 }}>Course Integrity Status</h2>
            <Info size={18} color="var(--clr-neutral)" />
          </div>
          
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 'var(--fs-label-md)', fontWeight: 500 }}>Mathematics</span>
              <span style={{ fontSize: 'var(--fs-label-md)', fontWeight: 700 }}>94%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '94%' }} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 'var(--fs-label-md)', fontWeight: 500 }}>Computer Science</span>
              <span style={{ fontSize: 'var(--fs-label-md)', fontWeight: 700 }}>88%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '88%' }} />
            </div>
          </div>
        </div>

        {/* Integrity Alerts */}
        <h2 style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 700, marginBottom: 12 }}>Integrity Alerts</h2>
        {highRiskIncidents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '24px 20px', color: 'var(--clr-neutral)' }}>
            ✓ No high or medium risk warnings active.
          </div>
        ) : (
          highRiskIncidents.map((a) => {
            const lastEvent = a.timeline && a.timeline.length > 0 ? a.timeline[a.timeline.length - 1] : null;
            const type = lastEvent ? lastEvent.type : 'tab_switch';
            const Icon = ICON_MAP[type] || AlertTriangle;
            
            return (
              <div 
                key={a._id} 
                className="card" 
                onClick={() => navigate(`/incident/${a.caseNumber}`)}
                style={{ 
                  borderLeft: `4px solid ${COLOR_MAP[type] || 'var(--clr-neutral)'}`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 14, 
                  marginBottom: 10,
                  cursor: 'pointer' 
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--r-md)',
                  background: BG_MAP[type] || 'var(--clr-surface-low)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={20} color={COLOR_MAP[type] || 'var(--clr-neutral)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{a.student ? a.student.name : 'Unknown Candidate'}</div>
                  <div style={{ fontSize: 'var(--fs-label-md)', color: 'var(--clr-neutral)' }}>
                    {lastEvent ? lastEvent.label : 'Anomaly Detected'} in {a.exam ? a.exam.title : 'Exam'}
                  </div>
                </div>
                <span style={{ fontSize: 'var(--fs-label-sm)', fontWeight: 700, color: COLOR_MAP[type], whiteSpace: 'nowrap' }}>
                  {getRiskString(a.riskScore)}
                </span>
              </div>
            );
          })
        )}

        {/* AI Proctoring banner */}
        <div style={{
          background: 'var(--clr-primary)',
          borderRadius: 'var(--r-md)',
          padding: '24px 20px',
          textAlign: 'center',
          marginTop: 20,
        }}>
          <Sparkles size={28} color="rgba(255,255,255,.7)" style={{ marginBottom: 10 }} />
          <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 'var(--fs-label-md)', lineHeight: 1.7 }}>
            Active Proctoring System is protecting<br />
            <strong style={{ color: 'white' }}>{incidents.filter(i => i.status === 'pending').length} pending review cases</strong> in MongoDB Atlas.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
