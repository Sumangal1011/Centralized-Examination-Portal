import { useState } from 'react';
import { Search, Download, SlidersHorizontal, ShieldAlert, GraduationCap, UserCog, Server, RefreshCw } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const FILTER_DEPTS  = ['All Depts', 'IT Security', 'Registrar', 'Academics'];
const FILTER_LEVELS = [
  { label: 'Critical', color: 'var(--clr-high)' },
  { label: 'Warning',  color: 'var(--clr-medium)' },
  { label: 'Info',     color: 'var(--clr-ai-blue)' },
];

const LOGS_TODAY = [
  {
    tag: 'SECURITY POLICY CHANGED', tagColor: 'var(--clr-high)',
    time: '10:42 AM',
    body: <>Global proctoring timeout threshold reduced from 15m to 5m by <strong>admin_root</strong>.</>,
    dept: 'IT Security', deptIcon: ShieldAlert,
  },
  {
    tag: 'EXAM CREATED', tagColor: 'var(--clr-ai-blue)',
    time: '09:15 AM',
    body: <>"Final Mathematics 2024" instance initialized for 4,200 students in North Campus.</>,
    dept: 'Academics', deptIcon: GraduationCap,
  },
];

const LOGS_YESTERDAY = [
  {
    tag: 'USER UPDATED', tagColor: 'var(--clr-medium)',
    time: '04:30 PM',
    body: <>Multiple login failures detected for user <strong>alex_j_22</strong>. Password reset enforced.</>,
    dept: 'Registrar', deptIcon: UserCog,
  },
  {
    tag: 'SYSTEM AUDIT', tagColor: 'var(--clr-neutral)',
    time: '01:00 PM',
    body: <>Weekly redundancy backup completed successfully across all cloud regions.</>,
    dept: 'Infrastructure', deptIcon: Server,
  },
];

function LogCard({ tag, tagColor, time, body, dept, deptIcon: DeptIcon }) {
  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 'var(--fs-label-sm)', fontWeight: 700, color: tagColor, letterSpacing: '.04em' }}>{tag}</span>
        <span style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)' }}>{time}</span>
      </div>
      <p style={{ fontSize: 'var(--fs-label-md)', color: 'var(--clr-primary)', lineHeight: 1.6, marginBottom: 10 }}>{body}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-sm)' }}>
          <DeptIcon size={14} />
          {dept}
        </div>
        <button style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)', fontWeight: 500 }}>Details &gt;</button>
      </div>
    </div>
  );
}

export default function AuditLogPage() {
  const [activeLevel, setActiveLevel] = useState('Critical');
  const [activeDept, setActiveDept] = useState('All Depts');

  return (
    <div className="page-wrapper">
      <TopBar
        title="System Audit"
        rightSlot={
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Search size={22} color="var(--clr-primary)" />
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#64748b,#0f172a)', border: '2px solid var(--clr-border)' }} />
          </div>
        }
      />

      <div className="page-content">
        {/* Hero */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 'var(--fs-display)', fontWeight: 700, marginBottom: 4 }}>Live Activity</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)', maxWidth: '60%' }}>
              Monitoring enterprise-level changes
            </p>
            <span className="chip chip-ai" style={{ whiteSpace: 'nowrap' }}>SYSTEM LEVEL</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total Logs', value: '12,840', color: 'var(--clr-primary)' },
            { label: 'High Risk',  value: '12',     color: 'var(--clr-high)' },
            { label: 'Updates',    value: '142',     color: 'var(--clr-neutral)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--clr-neutral)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 'var(--fs-headline-md)', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--fs-label-md)' }}>Filter By</span>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)' }}>
            <SlidersHorizontal size={14} /> Clear All
          </button>
        </div>
        {/* Dept chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {FILTER_DEPTS.map(d => (
            <button
              key={d}
              id={`dept-${d.replace(/\s+/g,'-').toLowerCase()}`}
              onClick={() => setActiveDept(d)}
              style={{
                padding: '8px 16px', borderRadius: 'var(--r-full)',
                border: '1px solid var(--clr-border)',
                background: activeDept === d ? 'var(--clr-primary)' : 'var(--clr-white)',
                color: activeDept === d ? 'var(--clr-white)' : 'var(--clr-primary)',
                fontWeight: 500, fontSize: 'var(--fs-label-md)',
                cursor: 'pointer', transition: 'all .2s',
              }}
            >{d}</button>
          ))}
        </div>
        {/* Level chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {FILTER_LEVELS.map(({ label, color }) => (
            <button
              key={label}
              id={`level-${label.toLowerCase()}`}
              onClick={() => setActiveLevel(label)}
              style={{
                padding: '8px 14px', borderRadius: 'var(--r-full)',
                border: `1px solid ${activeLevel === label ? color : 'var(--clr-border)'}`,
                background: activeLevel === label ? `${color}15` : 'var(--clr-white)',
                color: activeLevel === label ? color : 'var(--clr-primary)',
                fontWeight: 600, fontSize: 'var(--fs-label-md)',
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer', transition: 'all .2s',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
              {label}
            </button>
          ))}
        </div>

        {/* TODAY */}
        <div style={{ fontSize: 'var(--fs-label-sm)', fontWeight: 700, color: 'var(--clr-neutral)', letterSpacing: '.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          TODAY
          <div style={{ flex: 1, height: 1, background: 'var(--clr-border)' }} />
        </div>
        {LOGS_TODAY.map((l, i) => <LogCard key={i} {...l} />)}

        {/* YESTERDAY */}
        <div style={{ fontSize: 'var(--fs-label-sm)', fontWeight: 700, color: 'var(--clr-neutral)', letterSpacing: '.08em', margin: '16px 0 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
          YESTERDAY
          <div style={{ flex: 1, height: 1, background: 'var(--clr-border)' }} />
        </div>
        {LOGS_YESTERDAY.map((l, i) => <LogCard key={i} {...l} />)}

        {/* Syncing indicator */}
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)' }}>
          <RefreshCw size={20} style={{ animation: 'spin 1.5s linear infinite', marginBottom: 6 }} /><br />
          Syncing archive…
        </div>
      </div>

      {/* Download FAB */}
      <button
        id="btn-download-logs"
        aria-label="Download logs"
        style={{
          position: 'fixed', bottom: 80, right: 20,
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--clr-primary)',
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-float)', zIndex: 90,
        }}
      >
        <Download size={22} />
      </button>

      <BottomNav />
    </div>
  );
}
