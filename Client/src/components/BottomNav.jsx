import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Shield, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['student', 'examiner', 'admin'] },
  { label: 'Exams',     icon: ClipboardList,  path: '/questions', roles: ['examiner', 'admin'] },
  { label: 'Audit',     icon: Shield,         path: '/analysis',  roles: ['examiner', 'admin'] },
  { label: 'Settings',  icon: Settings,       path: '/settings',  roles: ['student', 'examiner', 'admin'] },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'student';

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <nav className="bottom-nav">
      {visibleItems.map(({ label, icon: Icon, path }) => {
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
