import { useNavigate } from 'react-router-dom';
import { Settings, Bell, Moon, Shield, HelpCircle, LogOut } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';

const SETTING_ITEMS = [
  { icon: Bell,       label: 'Notifications',    sub: 'Manage alert preferences' },
  { icon: Moon,       label: 'Appearance',       sub: 'Dark mode & themes' },
  { icon: Shield,     label: 'Security',         sub: '2FA, biometrics' },
  { icon: HelpCircle, label: 'Help & Support',   sub: 'FAQs, contact us' },
  { icon: LogOut,     label: 'Sign Out',         sub: 'Securely log out', danger: true },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const name = user.name || 'Academic Member';
  const role = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member';
  const uid = user.uid || 'N/A';

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
      navigate('/');
    }
  };

  return (
    <div className="page-wrapper">
      <TopBar title="Settings" />

      <div className="page-content">
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
              color: danger ? 'var(--clr-high)' : 'var(--clr-primary)',
              transition: 'background .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-surface)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--clr-white)'}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--r-md)',
              background: danger ? 'var(--clr-high-bg)' : 'var(--clr-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={18} color={danger ? 'var(--clr-high)' : 'var(--clr-neutral)'} />
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

      <BottomNav />
    </div>
  );
}
