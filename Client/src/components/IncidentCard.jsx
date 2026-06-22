import { useNavigate } from 'react-router-dom';

const BORDER_COLORS = {
  'HIGH RISK':   'var(--clr-high)',
  'MEDIUM RISK': 'var(--clr-medium)',
  'LOW RISK':    'var(--clr-low)',
};

export default function IncidentCard({ icon: Icon, iconBg, title, sub, risk, onClick }) {
  const navigate = useNavigate();
  const borderColor = BORDER_COLORS[risk] || 'var(--clr-border)';
  const chipClass =
    risk === 'HIGH RISK' ? 'chip chip-high' :
    risk === 'LOW RISK'  ? 'chip chip-low'  : 'chip chip-medium';

  return (
    <div
      className="card"
      onClick={() => onClick ? onClick() : navigate('/incident/1')}
      style={{
        borderLeft: `4px solid ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 10,
        cursor: 'pointer',
        transition: 'box-shadow .2s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 'var(--r-md)',
        background: iconBg || 'var(--clr-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={borderColor} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--fs-body-md)', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)' }}>{sub}</div>
      </div>
      <span className={chipClass}>{risk}</span>
    </div>
  );
}
