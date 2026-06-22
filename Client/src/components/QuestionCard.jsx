import { Pencil, MoreVertical } from 'lucide-react';

const DIFFICULTY_CLASS = { Hard: 'chip chip-hard', Easy: 'chip chip-easy', Medium: 'chip chip-medium' };
const BORDER = { Hard: 'var(--clr-high)', Easy: 'var(--clr-low)', Medium: 'var(--clr-medium)' };

export default function QuestionCard({ id, title, updated, subject, difficulty, tags }) {
  const chipCls = DIFFICULTY_CLASS[difficulty] || 'chip chip-medium';
  const border = BORDER[difficulty] || 'var(--clr-ai-blue)';

  return (
    <div className="card" style={{ borderLeft: `4px solid ${border}`, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)', fontWeight: 500 }}>{id}</span>
        <span className={chipCls}>{difficulty}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 'var(--fs-body-md)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)', marginBottom: 10 }}>
        {updated} • {subject}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(tags || []).map(t => (
            <span key={t} className="chip chip-ai" style={{ fontSize: 10 }}>{t}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, color: 'var(--clr-neutral)' }}>
          <button aria-label="Edit question"><Pencil size={16} /></button>
          <button aria-label="More options"><MoreVertical size={16} /></button>
        </div>
      </div>
    </div>
  );
}
