import { useNavigate } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatMoney } from '../lib/format';
import type { SpendPerCar } from '../lib/analytics';

interface SpendDonutProps {
  data: SpendPerCar[];
}

export function SpendDonut({ data }: SpendDonutProps) {
  const navigate = useNavigate();
  const total = data.reduce((sum, d) => sum + d.total, 0);

  if (data.length === 0) {
    return (
      <div className="card grid place-items-center p-10 text-center">
        <p className="text-sm text-ink-muted">
          Add expenses to any car and the spend breakdown will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-medium tracking-tight">Spend by car</h2>
        <span className="text-sm text-ink-muted">Click a slice to drill in</span>
      </header>
      <div className="grid items-center gap-6 md:grid-cols-[1fr_1.2fr]">
        <div className="relative h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="carName"
                innerRadius="62%"
                outerRadius="92%"
                paddingAngle={1.5}
                stroke="rgb(var(--surface-raised))"
                strokeWidth={2}
                onClick={(payload) => {
                  if (payload && 'carId' in payload) {
                    navigate(`/garage/${(payload as { carId: string }).carId}`);
                  }
                }}
              >
                {data.map((d) => (
                  <Cell key={d.carId} fill={d.hex} className="cursor-pointer" />
                ))}
              </Pie>
              <Tooltip
                cursor={{ fill: 'rgb(var(--surface-muted))' }}
                contentStyle={{
                  background: 'rgb(var(--surface-raised))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: 12,
                  color: 'rgb(var(--ink))',
                  fontSize: 12,
                }}
                formatter={(value, name) => [formatMoney(Number(value)), name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-ink-subtle">Total</p>
              <p className="font-display text-xl font-medium tabular-nums">
                {formatMoney(total)}
              </p>
            </div>
          </div>
        </div>
        <ul className="grid gap-2">
          {data.map((d) => {
            const pct = total > 0 ? Math.round((d.total / total) * 100) : 0;
            return (
              <li key={d.carId}>
                <button
                  type="button"
                  onClick={() => navigate(`/garage/${d.carId}`)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-surface-muted"
                >
                  <span
                    aria-hidden
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ background: d.hex }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">{d.carName}</span>
                  <span className="text-sm font-medium tabular-nums">
                    {formatMoney(d.total)}
                  </span>
                  <span className="w-10 text-right text-xs text-ink-muted tabular-nums">
                    {pct}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
