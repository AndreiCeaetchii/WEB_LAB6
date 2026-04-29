import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useCarsStore } from '../stores/carsStore';
import { useExpensesStore } from '../stores/expensesStore';
import { formatMoney } from '../lib/format';

export default function DashboardPage() {
  const cars = useCarsStore((s) => s.cars);
  const loadCars = useCarsStore((s) => s.load);
  const expenses = useExpensesStore((s) => s.expenses);
  const loadExpenses = useExpensesStore((s) => s.load);

  useEffect(() => {
    void loadCars();
    void loadExpenses();
  }, [loadCars, loadExpenses]);

  const favCount = useMemo(() => cars.filter((c) => c.favorite).length, [cars]);

  const ytdTotal = useMemo(() => {
    const year = new Date().getFullYear();
    return expenses
      .filter((e) => new Date(e.date).getFullYear() === year)
      .reduce((sum, e) => sum + (Number(e.cost) || 0), 0);
  }, [expenses]);

  const lastExpenseDate = useMemo(() => {
    if (expenses.length === 0) return null;
    const sorted = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1));
    return sorted[0].date;
  }, [expenses]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Quick view of your fleet — expiring documents, spending breakdown, and monthly trends."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Cars</p>
          <p className="mt-2 font-display text-3xl font-medium">{cars.length}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {favCount > 0
              ? `${favCount} favorited`
              : cars.length
                ? 'Tap the star on any car to favorite it.'
                : 'Add your first car to start tracking.'}
          </p>
          <Link to="/garage" className="btn-outline mt-4 inline-flex">
            Manage garage
          </Link>
        </div>
        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Total spent (YTD)
          </p>
          <p className="mt-2 font-display text-3xl font-medium tabular-nums">
            {expenses.length === 0 ? '—' : formatMoney(ytdTotal)}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {expenses.length === 0
              ? 'No expenses recorded yet.'
              : lastExpenseDate
                ? `${expenses.length} entries · last on ${new Date(lastExpenseDate).toLocaleDateString()}`
                : `${expenses.length} entries`}
          </p>
          <Link to="/expenses" className="btn-outline mt-4 inline-flex">
            View expenses
          </Link>
        </div>
        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Expiring soon
          </p>
          <p className="mt-2 font-display text-3xl font-medium">—</p>
          <p className="mt-1 text-sm text-ink-muted">Documents page lands in PR 4.</p>
        </div>
      </div>
      <div className="mt-6 card p-6">
        <h2 className="font-display text-xl font-medium">Charts coming soon</h2>
        <p className="mt-1 text-sm text-ink-muted">
          The donut chart, monthly trend, and expiring alerts strip ship in the Dashboard
          Analytics PR.
        </p>
      </div>
    </>
  );
}
