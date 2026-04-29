import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useCarsStore } from '../stores/carsStore';

export default function DashboardPage() {
  const cars = useCarsStore((s) => s.cars);
  const load = useCarsStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  const favCount = useMemo(() => cars.filter((c) => c.favorite).length, [cars]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Quick view of your fleet — expiring documents, spending breakdown, and monthly trends."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Cars</p>
          <p className="mt-2 text-3xl font-semibold">{cars.length}</p>
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
          <p className="mt-2 text-3xl font-semibold">—</p>
          <p className="mt-1 text-sm text-ink-muted">Expense tracking ships in the next PR.</p>
        </div>
        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Expiring soon
          </p>
          <p className="mt-2 text-3xl font-semibold">—</p>
          <p className="mt-1 text-sm text-ink-muted">Documents page lands in PR 4.</p>
        </div>
      </div>
      <div className="mt-6 card p-6">
        <h2 className="text-lg font-semibold">Charts coming soon</h2>
        <p className="mt-1 text-sm text-ink-muted">
          The donut chart, monthly trend, and expiring alerts strip ship in the Dashboard
          Analytics PR.
        </p>
      </div>
    </>
  );
}
