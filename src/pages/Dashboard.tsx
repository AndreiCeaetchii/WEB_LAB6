import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SpendDonut } from '../components/SpendDonut';
import { MonthlyTrend } from '../components/MonthlyTrend';
import { useCarsStore } from '../stores/carsStore';
import { useExpensesStore } from '../stores/expensesStore';
import { useDocumentsStore } from '../stores/documentsStore';
import { formatMoney } from '../lib/format';
import { EXPIRING_WINDOW_DAYS, daysUntil, getStatus } from '../lib/validity';
import { monthlyTrend, spendPerCar } from '../lib/analytics';

export default function DashboardPage() {
  const cars = useCarsStore((s) => s.cars);
  const loadCars = useCarsStore((s) => s.load);
  const expenses = useExpensesStore((s) => s.expenses);
  const loadExpenses = useExpensesStore((s) => s.load);
  const documents = useDocumentsStore((s) => s.documents);
  const loadDocuments = useDocumentsStore((s) => s.load);

  useEffect(() => {
    void loadCars();
    void loadExpenses();
    void loadDocuments();
  }, [loadCars, loadExpenses, loadDocuments]);

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

  const expiringSoon = useMemo(() => {
    return documents
      .filter((d) => {
        const status = getStatus(d.endDate);
        return status === 'expiring' || status === 'expired';
      })
      .sort((a, b) => (a.endDate < b.endDate ? -1 : 1));
  }, [documents]);

  const donutData = useMemo(() => spendPerCar(cars, expenses), [cars, expenses]);
  const trendData = useMemo(() => monthlyTrend(expenses, 12), [expenses]);

  const favCount = useMemo(() => cars.filter((c) => c.favorite).length, [cars]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Quick view of your fleet — expiring documents, spending breakdown, and monthly trends."
      />

      {expiringSoon.length > 0 && (
        <div className="mb-6 rounded-2xl border border-warn/30 bg-warn/5 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-medium text-warn">
              {expiringSoon.length} document{expiringSoon.length === 1 ? '' : 's'} need attention
            </h2>
            <Link
              to={expiringSoon[0]?.kind === 'rca' ? '/insurance' : '/cartea-verde'}
              className="text-sm font-medium text-warn hover:underline"
            >
              View →
            </Link>
          </div>
          <ul className="mt-3 grid gap-1 text-sm">
            {expiringSoon.slice(0, 4).map((d) => {
              const days = daysUntil(d.endDate);
              const car = cars.find((c) => c.id === d.carId);
              return (
                <li key={d.id} className="flex flex-wrap items-baseline gap-2">
                  <span className="font-medium">
                    {d.kind === 'rca' ? 'RCA' : 'Cartea Verde'}
                  </span>
                  {car && (
                    <span className="text-ink-muted">
                      · {car.make} {car.model}
                    </span>
                  )}
                  <span
                    className={`text-xs uppercase tracking-wide ${days < 0 ? 'text-danger' : 'text-warn'}`}
                  >
                    {days < 0
                      ? `Expired ${Math.abs(days)}d ago`
                      : `${days}d left`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

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
            Expiring within {EXPIRING_WINDOW_DAYS} days
          </p>
          <p className="mt-2 font-display text-3xl font-medium">
            {expiringSoon.length}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {documents.length === 0
              ? 'No documents tracked yet.'
              : expiringSoon.length === 0
                ? 'All documents are valid.'
                : 'Renew before they lapse.'}
          </p>
          <Link to="/insurance" className="btn-outline mt-4 inline-flex">
            View documents
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <SpendDonut data={donutData} />
        <MonthlyTrend data={trendData} />
      </div>
    </>
  );
}
