import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DATA = [
  { day: 'Mon', violations: 3 },
  { day: 'Tue', violations: 7 },
  { day: 'Wed', violations: 12 },
  { day: 'Thu', violations: 8 },
  { day: 'Fri', violations: 6 },
  { day: 'Sat', violations: 9 },
  { day: 'Sun', violations: 18 },
];

export default function ViolationChart() {
  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--fs-body-lg)' }}>Violation Trends</span>
        <span className="chip chip-ai">Last 7 Days</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={DATA} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--clr-border)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: 'var(--clr-neutral)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: 'var(--clr-white)',
              border: '1px solid var(--clr-border)',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="violations"
            stroke="var(--clr-primary)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: 'var(--clr-primary)' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
