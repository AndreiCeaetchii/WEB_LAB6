import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseRow } from '../components/ExpenseRow';
import { ExpenseIcon, PlusIcon } from '../components/icons';
import { useCarsStore } from '../stores/carsStore';
import { useExpensesStore } from '../stores/expensesStore';
import { formatMoney } from '../lib/format';
import type { Expense, ExpenseCategory, ID } from '../lib/types';

const CATEGORIES: ExpenseCategory[] = ['fuel', 'repair', 'parts', 'inspection', 'other'];
const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  fuel: 'Fuel',
  repair: 'Repair',
  parts: 'Parts',
  inspection: 'Inspection',
  other: 'Other',
};

export default function ExpensesPage() {
  const cars = useCarsStore((s) => s.cars);
  const carsLoaded = useCarsStore((s) => s.loaded);
  const loadCars = useCarsStore((s) => s.load);
  const expenses = useExpensesStore((s) => s.expenses);
  const expensesLoaded = useExpensesStore((s) => s.loaded);
  const loadExpenses = useExpensesStore((s) => s.load);
  const remove = useExpensesStore((s) => s.remove);

  useEffect(() => {
    void loadCars();
    void loadExpenses();
  }, [loadCars, loadExpenses]);

  const [carFilter, setCarFilter] = useState<ID | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [editing, setEditing] = useState<Expense | undefined>();
  const [formOpen, setFormOpen] = useState(false);

  const carsById = useMemo(
    () => new Map(cars.map((c) => [c.id, c] as const)),
    [cars],
  );

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (carFilter !== 'all' && e.carId !== carFilter) return false;
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      return true;
    });
  }, [expenses, carFilter, categoryFilter]);

  const total = useMemo(
    () => filtered.reduce((sum, e) => sum + (Number(e.cost) || 0), 0),
    [filtered],
  );

  const handleAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const handleEdit = (e: Expense) => {
    setEditing(e);
    setFormOpen(true);
  };

  const handleDelete = async (e: Expense) => {
    if (!confirm('Remove this expense? This cannot be undone.')) return;
    await remove(e.id);
  };

  const ready = carsLoaded && expensesLoaded;

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Fuel, repairs, parts, and technical inspection costs across your fleet."
        actions={
          <button
            type="button"
            onClick={handleAdd}
            disabled={cars.length === 0}
            className="btn-primary"
            title={cars.length === 0 ? 'Add a car first' : undefined}
          >
            <PlusIcon className="h-4 w-4" />
            Record expense
          </button>
        }
      />

      {!ready ? (
        <div className="card grid place-items-center p-12 text-ink-muted">Loading…</div>
      ) : cars.length === 0 ? (
        <EmptyState
          icon={<ExpenseIcon className="h-7 w-7" />}
          title="Add a car first"
          description="You need at least one car in your garage before you can record expenses against it."
        />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={<ExpenseIcon className="h-7 w-7" />}
          title="No expenses recorded"
          description="Track every fuel stop, repair bill, and inspection — the dashboard will roll them up automatically."
          action={
            <button type="button" onClick={handleAdd} className="btn-primary">
              <PlusIcon className="h-4 w-4" />
              Record your first expense
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
                  Car
                </span>
                <FilterChip
                  active={carFilter === 'all'}
                  onClick={() => setCarFilter('all')}
                >
                  All cars
                </FilterChip>
                {cars.map((c) => (
                  <FilterChip
                    key={c.id}
                    active={carFilter === c.id}
                    onClick={() => setCarFilter(c.id)}
                  >
                    {c.make} {c.model}
                  </FilterChip>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
                  Type
                </span>
                <FilterChip
                  active={categoryFilter === 'all'}
                  onClick={() => setCategoryFilter('all')}
                >
                  All categories
                </FilterChip>
                {CATEGORIES.map((cat) => (
                  <FilterChip
                    key={cat}
                    active={categoryFilter === cat}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {CATEGORY_LABEL[cat]}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div className="card px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wide text-ink-subtle">Filtered total</p>
              <p className="font-display text-2xl font-medium tabular-nums">
                {formatMoney(total)}
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="card p-8 text-center text-sm text-ink-muted">
              No expenses match the current filters.
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((e) => (
                <ExpenseRow
                  key={e.id}
                  expense={e}
                  car={carsById.get(e.carId)}
                  onEdit={() => handleEdit(e)}
                  onDelete={() => handleDelete(e)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ExpenseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        expense={editing}
      />
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip cursor-pointer transition-colors ${
        active
          ? 'border-brand bg-brand/10 text-brand'
          : 'hover:border-brand/40'
      }`}
    >
      {children}
    </button>
  );
}
