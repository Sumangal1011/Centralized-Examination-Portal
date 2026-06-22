import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Shield, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Exams',     icon: ClipboardList,  path: '/questions' },
  { label: 'Audit',     icon: Shield,         path: '/analysis' },
  { label: 'Settings',  icon: Settings,       path: '/settings' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(path)}
            aria-label={label}
          >
            <span className={active ? 'nav-icon-bg' : ''}>
              <Icon size={22} />
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
