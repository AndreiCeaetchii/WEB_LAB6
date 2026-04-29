import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatMoney } from '../lib/format';
import type { MonthlyBucket } from '../lib/analytics';

interface MonthlyTrendProps {
  data: MonthlyBucket[];
}

export function MonthlyTrend({ data }: MonthlyTrendProps) {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  const peak = data.reduce((m, d) => (d.total > m ? d.total : m), 0);

  if (total === 0) {
    return (
      <div className="card grid place-items-center p-10 text-center">
        <p className="text-sm text-ink-muted">
          The monthly trend will populate once you record expenses.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-medium tracking-tight">
          Monthly spending
        </h2>
        <p className="text-sm text-ink-muted">
          Last 12 months · peak {formatMoney(peak)}
        </p>
      </header>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'rgb(var(--ink-muted))' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fontSize: 11, fill: 'rgb(var(--ink-muted))' }}
              tickFormatter={(v) => {
                const n = Number(v);
                return n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n);
              }}
            />
            <Tooltip
              cursor={{ fill: 'rgb(var(--surface-muted))' }}
              contentStyle={{
                background: 'rgb(var(--surface-raised))',
                border: '1px solid rgb(var(--border))',
                borderRadius: 12,
                color: 'rgb(var(--ink))',
                fontSize: 12,
              }}
              formatter={(value) => [formatMoney(Number(value)), 'Spent']}
            />
            <Bar
              dataKey="total"
              fill="rgb(var(--brand))"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
