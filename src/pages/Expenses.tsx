import { PageHeader } from '../components/PageHeader';

export default function ExpensesPage() {
  return (
    <>
      <PageHeader
        title="Expenses"
        description="Track fuel, repair, parts, and technical inspection costs across all your cars."
      />
      <div className="card grid place-items-center p-12 text-center">
        <p className="max-w-md text-ink-muted">
          Expense recording lands in the Expense Tracking PR.
        </p>
      </div>
    </>
  );
}
