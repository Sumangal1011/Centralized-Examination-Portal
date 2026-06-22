export default function StatCard({ label, value, sub, subColor, icon: Icon, extra }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: 'var(--fs-label-sm)',
          fontWeight: 600,
          color: 'var(--clr-neutral)',
          textTransform: 'uppercase',
          letterSpacing: '.06em'
        }}>{label}</span>
        {Icon && <Icon size={22} color="var(--clr-neutral-light)" />}
      </div>
      <div style={{ fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 'var(--fs-label-md)', color: subColor || 'var(--clr-neutral)' }}>{sub}</div>
      )}
      {extra}
    </div>
  );
}
