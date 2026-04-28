import { PageHeader } from '../components/PageHeader';

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Quick view of your fleet — expiring documents, spending breakdown, and monthly trends."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Total spent (YTD)
          </p>
          <p className="mt-2 text-3xl font-semibold">—</p>
          <p className="mt-1 text-sm text-ink-muted">Add a car to start tracking expenses.</p>
        </div>
        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Expiring soon
          </p>
          <p className="mt-2 text-3xl font-semibold">0</p>
          <p className="mt-1 text-sm text-ink-muted">No documents tracked yet.</p>
        </div>
        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Cars</p>
          <p className="mt-2 text-3xl font-semibold">0</p>
          <p className="mt-1 text-sm text-ink-muted">Manage your garage in the Garage tab.</p>
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
