import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, User, Pencil, ShieldCheck, IdCard, Lock, Eye, EyeOff, Scan } from 'lucide-react';
import { authAPI } from '../utils/api';

const ROLES = [
  { id: 'student',  label: 'Student',  icon: User },
  { id: 'examiner', label: 'Examiner', icon: Pencil },
  { id: 'admin',    label: 'Admin',    icon: ShieldCheck },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [showPass, setShowPass] = useState(false);
  const [uid, setUid] = useState('');
  const [pass, setPass] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!uid.trim() || !pass.trim()) {
      setError('Please enter University ID and Password');
      return;
    }
    setLoading(true);
    try {
      const data = await authAPI.login(uid, pass, role);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      if (data.role === 'student') navigate('/verify');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: '40px 20px' }}>
      {/* Logo */}
      <div style={{
        width: 64, height: 64, borderRadius: 16, background: 'var(--clr-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
      }}>
        <GraduationCap size={32} color="white" />
      </div>

      <h1 style={{ fontSize: 'var(--fs-display)', fontWeight: 700, marginBottom: 4 }}>ExamAI</h1>
      <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)', marginBottom: 32, textAlign: 'center' }}>
        Lumina University Secure Access Portal
      </p>

      {/* Card */}
      <div className="card fade-in" style={{ width: '100%', maxWidth: 420, padding: '28px 24px' }}>
        {/* Role Selector */}
        <p style={{ fontSize: 'var(--fs-label-md)', fontWeight: 500, marginBottom: 12 }}>Select your role</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
          {ROLES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`role-${id}`}
              onClick={() => setRole(id)}
              style={{
                padding: '14px 8px',
                borderRadius: 'var(--r-md)',
                border: `1.5px solid ${role === id ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                background: role === id ? 'var(--clr-input-bg)' : 'var(--clr-white)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                fontWeight: role === id ? 600 : 400,
                fontSize: 'var(--fs-label-md)',
                transition: 'all .2s',
              }}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            background: 'var(--clr-high-bg)',
            color: 'var(--clr-high)',
            padding: '10px 14px',
            borderRadius: 'var(--r-md)',
            fontSize: 'var(--fs-label-md)',
            marginBottom: 16,
            fontWeight: 500,
            border: '1px solid rgba(220,38,38,.2)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* University ID */}
          <div className="input-group">
            <label className="input-label" htmlFor="uid">University ID</label>
            <div className="input-wrapper">
              <input
                id="uid"
                className="input-field"
                type="text"
                placeholder="L-12345678"
                value={uid}
                onChange={e => setUid(e.target.value)}
              />
              <IdCard size={18} className="input-icon" />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label" htmlFor="password">Access Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                className="input-field"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
              />
              <button
                type="button"
                className="input-icon"
                onClick={() => setShowPass(p => !p)}
                aria-label="Toggle password visibility"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPass ? <EyeOff size={18} /> : <Lock size={18} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--fs-label-md)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                id="remember-me"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--clr-primary)' }}
              />
              Remember me
            </label>
            <button type="button" style={{ color: 'var(--clr-ai-blue)', fontSize: 'var(--fs-label-md)', fontWeight: 500 }}>
              Forgot access key?
            </button>
          </div>

          <button type="submit" id="btn-signin" className="btn btn-primary" disabled={loading}>
            {loading ? 'Securing Access...' : 'Secure Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--clr-border)' }} />
          <span style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--clr-border)' }} />
        </div>

        <button
          id="btn-face-id"
          className="btn btn-secondary"
          onClick={() => navigate('/verify')}
        >
          <Scan size={20} />
          Sign in with Face ID
        </button>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, display: 'flex', gap: 20, fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={14} /> AI Proctoring Active
        </span>
        <span>|</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          🌐 System Online
        </span>
      </div>
      <p style={{ marginTop: 8, fontSize: 11, color: 'var(--clr-neutral-light)', textAlign: 'center' }}>
        © 2024 ExamAI Technologies. Protected by Lumina Cybersecurity.
      </p>
    </div>
  );
}
