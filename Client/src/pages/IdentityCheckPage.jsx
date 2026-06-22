import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck } from 'lucide-react';

export default function IdentityCheckPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState('analyzing'); // analyzing | matched
  const [confidence, setConfidence] = useState(0);

  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Alex Johnson"}');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('matched'), 2200);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (stage === 'matched') {
      let c = 0;
      const interval = setInterval(() => {
        c += 2;
        setConfidence(c);
        if (c >= 98) clearInterval(interval);
      }, 18);
      return () => clearInterval(interval);
    }
  }, [stage]);

  return (
    <div className="page-wrapper">
      {/* Top bar */}
      <div className="top-bar">
        <button onClick={() => navigate('/')} aria-label="Close" style={{ color: 'var(--clr-primary)' }}>
          <X size={24} />
        </button>
        <span className="top-bar-title" style={{ flex: 1, marginLeft: 12 }}>ExamAI</span>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--clr-border)', overflow: 'hidden' }}>
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#64748b,#0f172a)' }} />
        </div>
      </div>

      <div className="page-content" style={{ paddingBottom: 40 }}>
        <h1 style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
          Identity Check
        </h1>
        <p style={{ color: 'var(--clr-neutral)', textAlign: 'center', fontSize: 'var(--fs-body-md)', marginBottom: 28 }}>
          Position your face within the guide for AI verification.
        </p>

        {/* Camera frame */}
        <div style={{ position: 'relative', borderRadius: 'var(--r-md)', overflow: 'hidden', marginBottom: 20 }}>
          {/* Placeholder gradient "camera" */}
          <div style={{
            width: '100%',
            paddingBottom: '120%',
            background: 'linear-gradient(160deg, #1e293b 0%, #334155 50%, #0f172a 100%)',
            position: 'relative',
          }}>
            {/* Face silhouette */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '55%', height: '70%',
              borderRadius: '50%',
              background: 'rgba(255,255,255,.08)',
            }} />

            {/* Corner brackets */}
            {[
              { top: '12%', left: '14%', borderTop: '3px solid', borderLeft: '3px solid' },
              { top: '12%', right: '14%', borderTop: '3px solid', borderRight: '3px solid' },
              { bottom: '12%', left: '14%', borderBottom: '3px solid', borderLeft: '3px solid' },
              { bottom: '12%', right: '14%', borderBottom: '3px solid', borderRight: '3px solid' },
            ].map((s, i) => (
              <div key={i} style={{
                position: 'absolute', width: 28, height: 28,
                borderColor: 'var(--clr-ai-blue)',
                borderRadius: 3,
                ...s,
              }} />
            ))}

            {/* Face oval outline */}
            <div style={{
              position: 'absolute', top: '18%', left: '22%', right: '22%', bottom: '14%',
              border: `2.5px solid var(--clr-ai-blue)`,
              borderRadius: '50%',
              animation: stage === 'analyzing' ? 'pulse-glow 1.5s infinite' : 'none',
            }} />

            {/* AI Analyzing badge */}
            <div style={{
              position: 'absolute', top: 14, left: 14,
              background: 'rgba(255,255,255,.92)',
              borderRadius: 'var(--r-full)',
              padding: '5px 12px',
              fontSize: 'var(--fs-label-sm)',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'var(--clr-primary)',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: stage === 'analyzing' ? 'var(--clr-ai-blue)' : 'var(--clr-low)',
                animation: stage === 'analyzing' ? 'pulse-glow .8s infinite' : 'none',
              }} />
              {stage === 'analyzing' ? 'AI Analyzing…' : 'Verified ✓'}
            </div>
          </div>
        </div>

        {/* Match result card */}
        {stage === 'matched' && (
          <div className="card fade-in" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 'var(--r-md)',
                background: 'var(--clr-ai-blue-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldCheck size={26} color="var(--clr-ai-blue)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--fs-body-md)' }}>Match Found</div>
                <div style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)' }}>{user.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-ai-blue)', fontWeight: 600, marginBottom: 2 }}>Confidence</div>
                <div style={{ fontSize: 'var(--fs-headline-md)', fontWeight: 700, color: 'var(--clr-ai-blue)' }}>{confidence.toFixed(1)}%</div>
              </div>
            </div>
            <div className="progress-track" style={{ marginTop: 14 }}>
              <div className="progress-fill ai" style={{ width: `${confidence}%` }} />
            </div>
          </div>
        )}

        {/* Security note */}
        <div style={{
          background: 'var(--clr-surface-low)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--r-md)',
          padding: '12px 14px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
          fontSize: 'var(--fs-label-md)',
          color: 'var(--clr-neutral)',
          marginBottom: 28,
        }}>
          <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--clr-ai-blue)' }} />
          <span>
            Face biometric authenticated against system records. Proctoring level is set to{' '}
            <span style={{ color: 'var(--clr-ai-blue)', fontWeight: 600 }}>Secure High</span>.
          </span>
        </div>

        <button
          id="btn-proceed-exam"
          className="btn btn-primary"
          disabled={stage === 'analyzing'}
          onClick={() => navigate('/exam')}
          style={{ opacity: stage === 'analyzing' ? .5 : 1 }}
        >
          Proceed to Exam →
        </button>
      </div>
    </div>
  );
}
