import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell, Moon, Shield, HelpCircle, LogOut, Sun, CheckCircle, Info } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const name = user.name || 'Academic Member';
  const role = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member';
  const uid = user.uid || 'N/A';

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [notifications, setNotifications] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'security', 'help', 'notifications'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'US';

  const handleItemClick = (label) => {
    if (label === 'Sign Out') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('verifiedPhoto');
      localStorage.removeItem('selectedExamId');
      navigate('/');
    } else if (label === 'Appearance') {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    } else if (label === 'Notifications') {
      setActiveModal('notifications');
    } else if (label === 'Security') {
      setActiveModal('security');
    } else if (label === 'Help & Support') {
      setActiveModal('help');
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const SETTING_ITEMS = [
    { 
      icon: Bell, 
      label: 'Notifications', 
      sub: `Alert preference: ${notifications ? 'Enabled' : 'Disabled'}` 
    },
    { 
      icon: theme === 'dark' ? Moon : Sun, 
      label: 'Appearance', 
      sub: `Current theme: ${theme.toUpperCase()}` 
    },
    { 
      icon: Shield, 
      label: 'Security', 
      sub: '2FA, identity logs' 
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      sub: 'FAQ & instructions' 
    },
    { 
      icon: LogOut, 
      label: 'Sign Out', 
      sub: 'Securely log out', 
      danger: true 
    },
  ];

  return (
    <div className="page-wrapper">
      <TopBar title="Settings" />

      <div className="page-content" style={{ paddingBottom: 110 }}>
        {/* Profile card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #64748b, #0f172a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 'var(--fs-headline-md)' }}>{initials}</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--fs-body-lg)' }}>{name}</div>
            <div style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)' }}>{role} • ID: {uid}</div>
          </div>
        </div>

        {SETTING_ITEMS.map(({ icon: Icon, label, sub, danger }) => (
          <button
            key={label}
            id={`settings-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className="card"
            onClick={() => handleItemClick(label)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', textAlign: 'left', marginBottom: 10,
              cursor: 'pointer',
              color: danger ? 'var(--clr-high)' : 'var(--clr-text)',
              transition: 'background .2s',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--r-md)',
              background: danger ? 'var(--clr-high-bg)' : 'var(--clr-surface-high)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={18} color={danger ? 'var(--clr-high)' : 'var(--clr-neutral-light)'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 'var(--fs-label-sm)', color: danger ? 'var(--clr-high)' : 'var(--clr-neutral)', opacity: .8 }}>{sub}</div>
            </div>
            <span style={{ color: 'var(--clr-neutral)' }}>›</span>
          </button>
        ))}

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--clr-neutral-light)', marginTop: 24 }}>
          ExamAI v2.4.1 • © 2026 Lumina Technologies
        </p>
      </div>

      {/* Settings Action Modals */}
      {activeModal === 'notifications' && (
        <div style={modalOverlayStyle}>
          <div className="card fade-in" style={modalContentStyle}>
            <h3 style={{ marginBottom: 14, fontWeight: 700 }}>Notification Preferences</h3>
            <p style={{ color: 'var(--clr-neutral)', fontSize: 14, marginBottom: 20 }}>
              Receive updates regarding new examinations, graded results, and security alerts.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontWeight: 600 }}>Enable Notifications</span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                style={{ width: 40, height: 20, accentColor: 'var(--clr-brand)', cursor: 'pointer' }}
              />
            </div>
            <button className="btn btn-primary" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      {activeModal === 'security' && (
        <div style={modalOverlayStyle}>
          <div className="card fade-in" style={modalContentStyle}>
            <h3 style={{ marginBottom: 14, fontWeight: 700 }}>Security Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--clr-low-bg)', padding: '12px 14px', borderRadius: 'var(--r-md)', color: 'var(--clr-low)', marginBottom: 20 }}>
              <CheckCircle size={20} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Biometric Face ID Registered</span>
            </div>
            <p style={{ color: 'var(--clr-neutral)', fontSize: 13, lineHeight: 1.5, marginBottom: 24 }}>
              Your proctor identity checkpoints are verified using state-of-the-art Webgazer and face descriptor comparisons. To reset your face identity registry, contact system administrator.
            </p>
            <button className="btn btn-primary" onClick={closeModal}>Dismiss</button>
          </div>
        </div>
      )}

      {activeModal === 'help' && (
        <div style={modalOverlayStyle}>
          <div className="card fade-in" style={modalContentStyle}>
            <h3 style={{ marginBottom: 14, fontWeight: 700 }}>Help & Assessment Guidelines</h3>
            <div style={{ maxHeight: '250px', overflowY: 'auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, marginBottom: 20 }}>
              <div>
                <strong style={{ color: 'var(--clr-brand)' }}>1. Start assessment is not loading?</strong>
                <p style={{ color: 'var(--clr-neutral)', marginTop: 2 }}>Make sure you have approved camera permissions, and selected an exam from the assessment catalog list.</p>
              </div>
              <div>
                <strong style={{ color: 'var(--clr-brand)' }}>2. How does proctoring work?</strong>
                <p style={{ color: 'var(--clr-neutral)', marginTop: 2 }}>The browser tracks tab focus. If you switch tabs or minimize the window more than 3 times, the exam status is automatically updated to cancelled.</p>
              </div>
              <div>
                <strong style={{ color: 'var(--clr-brand)' }}>3. Verification is failing?</strong>
                <p style={{ color: 'var(--clr-neutral)', marginTop: 2 }}>Ensure you are in a well-lit environment and directly facing the web camera during identity check verification.</p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={closeModal}>Close Help</button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  padding: '20px',
};

const modalContentStyle = {
  maxWidth: '400px',
  width: '100%',
  textAlign: 'center',
  padding: '24px',
  boxShadow: 'var(--shadow-float)',
  border: '1px solid var(--clr-border)',
};
