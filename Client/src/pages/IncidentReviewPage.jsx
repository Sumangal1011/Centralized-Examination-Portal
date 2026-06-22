import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Play, Clock, EyeOff, Users, Mic, ShieldCheck, ChevronLeft, AlertTriangle } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { incidentAPI } from '../utils/api';

const ICON_MAP = {
  start: Clock,
  tab_switch: EyeOff,
  multiple_persons: Users,
  audio: Mic,
  submit: ShieldCheck,
};

const COLOR_MAP = {
  start: 'var(--clr-neutral)',
  tab_switch: 'var(--clr-high)',
  multiple_persons: 'var(--clr-high)',
  audio: 'var(--clr-ai-blue)',
  submit: 'var(--clr-low)',
};

export default function IncidentReviewPage() {
  const { id } = useParams(); // can be caseNumber e.g., AX-4092
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const data = await incidentAPI.getById(id);
        setIncident(data);
      } catch (err) {
        setError(err.message || 'Failed to load incident details');
      } finally {
        setLoading(false);
      }
    };
    fetchIncident();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!incident) return;
    setUpdating(true);
    try {
      const updated = await incidentAPI.updateStatus(incident.caseNumber, newStatus);
      setIncident(updated);
    } catch (err) {
      alert('Error updating incident status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 75) return 'var(--clr-high)';
    if (score >= 40) return 'var(--clr-medium)';
    return 'var(--clr-low)';
  };

  const formatEventTime = (timeStr) => {
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return timeStr;
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <p style={{ fontWeight: 600, color: 'var(--clr-neutral)' }}>Loading incident profile...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 20 }}>
        <p style={{ fontWeight: 600, color: 'var(--clr-high)', marginBottom: 12 }}>{error || 'Incident case details not found.'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
      </div>
    );
  }

  const riskColor = getRiskColor(incident.riskScore);

  return (
    <div className="page-wrapper">
      <TopBar
        title="ExamAI"
        leftSlot={
          <button onClick={() => navigate('/dashboard')} style={{ color: 'var(--clr-primary)', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={24} />
          </button>
        }
        rightSlot={
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#64748b,#0f172a)', border: '2px solid var(--clr-border)' }} />
        }
      />

      <div className="page-content" style={{ paddingBottom: 110 }}>
        {/* Heading */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span className={`chip ${incident.riskScore >= 75 ? 'chip-high' : incident.riskScore >= 40 ? 'chip-medium' : 'chip-low'}`}>
              {incident.riskScore >= 75 ? 'HIGH RISK' : incident.riskScore >= 40 ? 'MEDIUM RISK' : 'LOW RISK'}
            </span>
            <span style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)' }}>• Case #{incident.caseNumber}</span>
            <span className="chip" style={{ background: 'var(--clr-input-bg)', color: 'var(--clr-primary)' }}>
              {incident.status.toUpperCase()}
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700, marginBottom: 4 }}>
            Incident Review: {incident.student ? incident.student.name : 'Candidate'}
          </h1>
          <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)' }}>
            {incident.exam ? incident.exam.title : 'Assessment Paper'}
          </p>
          <p style={{ color: 'var(--clr-neutral-light)', fontSize: 11 }}>
            UID: {incident.student ? incident.student.uid : 'N/A'} • Subject: {incident.exam ? incident.exam.subject : 'N/A'}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {incident.status !== 'resolved' && (
            <button 
              className="btn btn-secondary" 
              style={{ flex: 1, height: 46 }}
              onClick={() => handleStatusUpdate('resolved')}
              disabled={updating}
            >
              Resolve Case
            </button>
          )}
          {incident.status !== 'flagged' && (
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, height: 46 }}
              onClick={() => handleStatusUpdate('flagged')}
              disabled={updating}
            >
              Flag for Action
            </button>
          )}
        </div>

        {/* Suspicious Activity Score */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 'var(--fs-label-md)', fontWeight: 500, color: 'var(--clr-neutral)', marginBottom: 8 }}>
            Suspicious Activity Score
          </div>
          <div style={{ fontSize: 56, fontWeight: 700, color: riskColor, lineHeight: 1 }}>
            {incident.riskScore}<span style={{ fontSize: 20, color: 'var(--clr-neutral-light)', fontWeight: 400 }}>/100</span>
          </div>
          <div className="progress-track" style={{ margin: '12px 0 8px' }}>
            <div className="progress-fill" style={{ width: `${incident.riskScore}%`, background: riskColor }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: riskColor, fontSize: 'var(--fs-label-md)', fontWeight: 600 }}>
            {incident.riskScore >= 75 ? '⚠ Critical Threshold Exceeded' : '✓ Acceptable Integrity Margin'}
          </div>
        </div>

        {/* Identity Verification */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>Identity Verification</span>
            <span className="chip chip-low" style={{ fontSize: 11 }}>Passed Pre-Check</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Reference image */}
            <div>
              <div style={{
                height: 100, borderRadius: 8, background: 'linear-gradient(135deg,#cbd5e1,#94a3b8)',
                marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {incident.student?.avatar ? (
                  <img src={incident.student.avatar} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 40, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,.4)' }} />
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--clr-neutral)', textAlign: 'center' }}>Reference Image</div>
            </div>
            {/* Incident snapshot */}
            <div>
              <div style={{
                height: 100, borderRadius: 8, border: `2px solid ${riskColor}`,
                background: 'linear-gradient(135deg,#fecaca,#f87171)',
                marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 40, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,.3)' }} />
              </div>
              <div style={{ fontSize: 11, color: riskColor, textAlign: 'center', fontWeight: 600 }}>
                Incident Snapshot
              </div>
            </div>
          </div>
        </div>

        {/* Session Recording */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--fs-label-md)' }}>Session Recording</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-label-sm)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: riskColor, display: 'inline-block' }} />
              <span style={{ color: 'var(--clr-neutral)' }}>Flagged Segment Highlighted</span>
            </div>
          </div>

          {/* Video player mockup */}
          <div style={{
            height: 160, borderRadius: 8, background: '#0f172a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 8, position: 'relative',
          }}>
            <button id="btn-play-video" aria-label="Play video" style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,.18)',
              border: '2px solid rgba(255,255,255,.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Play size={22} color="white" fill="white" />
            </button>
            {/* Timeline markers */}
            <div style={{
              position: 'absolute', bottom: 8, left: 12, right: 12,
              height: 4, borderRadius: 2, background: 'rgba(255,255,255,.2)',
            }}>
              <div style={{ width: '45%', height: '100%', background: 'var(--clr-ai-blue)', borderRadius: 2 }} />
              <div style={{ position: 'absolute', top: 0, left: '45%', width: '20%', height: '100%', background: riskColor, borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)' }}>
            <span>Resolution: 1080p • Duration: 00:45:00</span>
            <button style={{ color: 'var(--clr-ai-blue)', fontWeight: 600 }}>↗ Expand View</button>
          </div>
        </div>

        {/* Violation Timeline */}
        <div className="card" style={{ marginBottom: 14 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 16 }}>Violation Timeline</h2>
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            {incident.timeline && incident.timeline.length > 0 ? (
              incident.timeline.map((item, i) => {
                const Icon = ICON_MAP[item.type] || AlertTriangle;
                const color = COLOR_MAP[item.type] || 'var(--clr-neutral)';
                return (
                  <div key={i} style={{ position: 'relative', marginBottom: i < incident.timeline.length - 1 ? 20 : 0 }}>
                    {/* Vertical line */}
                    {i < incident.timeline.length - 1 && (
                      <div style={{
                        position: 'absolute', left: -18, top: 20,
                        width: 2, height: '100%',
                        background: 'var(--clr-border)',
                      }} />
                    )}
                    {/* Dot */}
                    <div style={{
                      position: 'absolute', left: -24, top: 2,
                      width: 12, height: 12, borderRadius: '50%',
                      background: color,
                      border: '2px solid var(--clr-white)',
                      boxShadow: `0 0 0 2px ${color}`,
                    }} />
                    <div>
                      <div style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)', marginBottom: 2 }}>
                        {formatEventTime(item.time)}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--fs-label-md)', color }}>
                        {item.label}
                      </div>
                      {item.sub && <div style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)', marginTop: 2 }}>{item.sub}</div>}
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)' }}>No events recorded.</p>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
