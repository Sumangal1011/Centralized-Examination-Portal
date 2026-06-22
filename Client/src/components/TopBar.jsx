import { useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft } from 'lucide-react';

export default function TopBar({ title, subtitle, showBack = false, rightSlot }) {
  const navigate = useNavigate();
  return (
    <div className="top-bar">
      <button
        onClick={() => showBack ? navigate(-1) : undefined}
        aria-label={showBack ? 'Go back' : 'Menu'}
        style={{ color: 'var(--clr-primary)', display: 'flex', alignItems: 'center' }}
      >
        {showBack ? <ArrowLeft size={24} /> : <Menu size={24} />}
      </button>

      <div style={{ flex: 1, marginLeft: 12 }}>
        <div className="top-bar-title">{title}</div>
        {subtitle && (
          <div style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)', marginTop: 1 }}>
            {subtitle}
          </div>
        )}
      </div>

      {rightSlot}
    </div>
  );
}
