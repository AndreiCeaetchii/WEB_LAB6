import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { Modal } from './Modal';
import { useCarsStore } from '../stores/carsStore';
import { useExpensesStore } from '../stores/expensesStore';
import { todayISO } from '../lib/format';
import type {
  Expense,
  ExpenseCategory,
  ExpenseInput,
  FuelExpense,
  RepairExpense,
  PartsExpense,
  InspectionExpense,
  OtherExpense,
  ID,
} from '../lib/types';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  expense?: Expense;
  /** Pre-select a car when adding (e.g. from CarDetail page). */
  defaultCarId?: ID;
}

const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  fuel: 'Fuel',
  repair: 'Repair',
  parts: 'Parts',
  inspection: 'Inspection',
  other: 'Other',
};

const CATEGORY_ICON: Record<ExpenseCategory, string> = {
  fuel: '⛽',
  repair: '🔧',
  parts: '🔩',
  inspection: '🛡',
  other: '✦',
};

type FuelField = 'fuelQuantity' | 'fuelUnitPrice' | 'cost';

interface FormState {
  carId: string;
  category: ExpenseCategory;
  date: string;
  cost: string;
  note: string;
  // fuel
  fuelQuantity: string;
  fuelUnitPrice: string;
  odometerKm: string;
  /** Most-recent-first list of which two fuel fields the user typed in directly. */
  fuelEditOrder: FuelField[];
  // repair
  description: string;
  mechanic: string;
  // parts
  partName: string;
  quantity: string;
  // inspection
  nextDueDate: string;
  // other
  otherDescription: string;
}

const blankState = (defaultCarId: string = ''): FormState => ({
  carId: defaultCarId,
  category: 'fuel',
  date: todayISO(),
  cost: '',
  note: '',
  fuelQuantity: '',
  fuelUnitPrice: '',
  odometerKm: '',
  fuelEditOrder: [],
  description: '',
  mechanic: '',
  partName: '',
  quantity: '1',
  nextDueDate: '',
  otherDescription: '',
});

function fromExpense(e: Expense): FormState {
  const base: FormState = {
    ...blankState(e.carId),
    carId: e.carId,
    category: e.category,
    date: e.date,
    cost: String(e.cost),
    note: e.note ?? '',
  };
  switch (e.category) {
    case 'fuel':
      return {
        ...base,
        fuelQuantity: String(e.quantity),
        fuelUnitPrice: String(e.unitPrice),
        odometerKm: e.odometerKm !== undefined ? String(e.odometerKm) : '',
        fuelEditOrder: ['fuelQuantity', 'fuelUnitPrice'],
      };
    case 'repair':
      return { ...base, description: e.description, mechanic: e.mechanic ?? '' };
    case 'parts':
      return { ...base, partName: e.partName, quantity: String(e.quantity) };
    case 'inspection':
      return { ...base, nextDueDate: e.nextDueDate ?? '' };
    case 'other':
      return { ...base, otherDescription: e.description };
  }
}

/**
 * Recompute the field NOT in `editOrder` from the two that are, if both parse to
 * positive numbers. Returns the patch to apply (may be empty). Rounds to 2 dp.
 */
function deriveFuelThird(state: FormState): Partial<FormState> {
  const all: FuelField[] = ['fuelQuantity', 'fuelUnitPrice', 'cost'];
  const known = state.fuelEditOrder.slice(0, 2);
  if (known.length < 2) return {};
  const target = all.find((f) => !known.includes(f));
  if (!target) return {};
  const a = Number(state[known[0]]);
  const b = Number(state[known[1]]);
  if (!Number.isFinite(a) || a <= 0 || !Number.isFinite(b) || b <= 0) return {};
  const round = (n: number) => (Math.round(n * 100) / 100).toString();
  if (target === 'cost') {
    // quantity * unitPrice
    const qty = Number(state.fuelQuantity);
    const unit = Number(state.fuelUnitPrice);
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unit) || unit <= 0) return {};
    return { cost: round(qty * unit) };
  }
  if (target === 'fuelUnitPrice') {
    const qty = Number(state.fuelQuantity);
    const total = Number(state.cost);
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(total) || total <= 0) return {};
    return { fuelUnitPrice: round(total / qty) };
  }
  // fuelQuantity
  const unit = Number(state.fuelUnitPrice);
  const total = Number(state.cost);
  if (!Number.isFinite(unit) || unit <= 0 || !Number.isFinite(total) || total <= 0) return {};
  return { fuelQuantity: round(total / unit) };
}

export function ExpenseForm({ open, onClose, expense, defaultCarId }: ExpenseFormProps) {
  const cars = useCarsStore((s) => s.cars);
  const add = useExpensesStore((s) => s.add);
  const update = useExpensesStore((s) => s.update);
  const [form, setForm] = useState<FormState>(() => blankState(defaultCarId));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(expense ? fromExpense(expense) : blankState(defaultCarId ?? cars[0]?.id ?? ''));
  }, [open, expense, defaultCarId, cars]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  /** Track which two fuel fields the user just edited, then auto-derive the third. */
  const setFuelField = (field: FuelField, value: string) => {
    setForm((s) => {
      const editOrder = [field, ...s.fuelEditOrder.filter((f) => f !== field)].slice(0, 2);
      const next = { ...s, [field]: value, fuelEditOrder: editOrder };
      return { ...next, ...deriveFuelThird(next) };
    });
  };

  const selectedCar = cars.find((c) => c.id === form.carId);
  const fuelUnit: 'L' | 'kWh' = selectedCar?.isElectric ? 'kWh' : 'L';
  const isElectric = selectedCar?.isElectric === true;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.carId) {
      toast.error('Pick a car first');
      return;
    }
    const cost = Number(form.cost);
    if (form.category !== 'fuel' && (!Number.isFinite(cost) || cost < 0)) {
      toast.error('Cost must be a positive number');
      return;
    }
    if (!form.date) {
      toast.error('Date is required');
      return;
    }

    let input: ExpenseInput;
    switch (form.category) {
      case 'fuel': {
        const qty = Number(form.fuelQuantity);
        const unitPrice = Number(form.fuelUnitPrice);
        if (!Number.isFinite(qty) || qty <= 0) {
          toast.error(`${fuelUnit === 'kWh' ? 'kWh' : 'Liters'} must be greater than zero`);
          return;
        }
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
          toast.error(`Price per ${fuelUnit} must be greater than zero`);
          return;
        }
        if (!Number.isFinite(cost) || cost <= 0) {
          toast.error('Total cost must be greater than zero');
          return;
        }
        const odo = form.odometerKm.trim() ? Number(form.odometerKm) : undefined;
        const fuelInput: Omit<FuelExpense, 'id' | 'createdAt' | 'updatedAt'> = {
          carId: form.carId,
          category: 'fuel',
          date: form.date,
          cost,
          note: form.note.trim() || undefined,
          unit: fuelUnit,
          quantity: qty,
          unitPrice,
          odometerKm: odo !== undefined && Number.isFinite(odo) ? odo : undefined,
        };
        input = fuelInput;
        break;
      }
      case 'repair': {
        if (!form.description.trim()) {
          toast.error('Describe the repair');
          return;
        }
        const repairInput: Omit<RepairExpense, 'id' | 'createdAt' | 'updatedAt'> = {
          carId: form.carId,
          category: 'repair',
          date: form.date,
          cost,
          note: form.note.trim() || undefined,
          description: form.description.trim(),
          mechanic: form.mechanic.trim() || undefined,
        };
        input = repairInput;
        break;
      }
      case 'parts': {
        if (!form.partName.trim()) {
          toast.error('Part name is required');
          return;
        }
        const qty = Number(form.quantity);
        const partsInput: Omit<PartsExpense, 'id' | 'createdAt' | 'updatedAt'> = {
          carId: form.carId,
          category: 'parts',
          date: form.date,
          cost,
          note: form.note.trim() || undefined,
          partName: form.partName.trim(),
          quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
        };
        input = partsInput;
        break;
      }
      case 'inspection': {
        const inspectionInput: Omit<InspectionExpense, 'id' | 'createdAt' | 'updatedAt'> = {
          carId: form.carId,
          category: 'inspection',
          date: form.date,
          cost,
          note: form.note.trim() || undefined,
          nextDueDate: form.nextDueDate.trim() || undefined,
        };
        input = inspectionInput;
        break;
      }
      case 'other': {
        if (!form.otherDescription.trim()) {
          toast.error('Add a short label (e.g. car wash, road tax)');
          return;
        }
        const otherInput: Omit<OtherExpense, 'id' | 'createdAt' | 'updatedAt'> = {
          carId: form.carId,
          category: 'other',
          date: form.date,
          cost,
          note: form.note.trim() || undefined,
          description: form.otherDescription.trim(),
        };
        input = otherInput;
        break;
      }
    }

    setSubmitting(true);
    try {
      if (expense) await update(expense.id, input);
      else await add(input);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Could not save the expense');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryFields: ReactNode = (() => {
    switch (form.category) {
      case 'fuel': {
        const derived = form.fuelEditOrder.length === 2
          ? (['fuelQuantity', 'fuelUnitPrice', 'cost'] as const).find(
              (f) => !form.fuelEditOrder.includes(f),
            )
          : undefined;
        const qtyLabel = isElectric ? 'kWh' : 'Liters';
        const priceLabel = isElectric ? 'Price / kWh' : 'Price / L';
        return (
          <>
            <p className="text-xs text-ink-subtle">
              {isElectric ? '⚡ Electric — fill any two of kWh, price/kWh, total. The third auto-fills.'
                : '⛽ Combustion — fill any two of liters, price/L, total. The third auto-fills.'}
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <label>
                <span className="label">
                  {qtyLabel}
                  {derived === 'fuelQuantity' && (
                    <span className="ml-1 text-xs text-ink-subtle">(auto)</span>
                  )}
                </span>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.fuelQuantity}
                  onChange={(e) => setFuelField('fuelQuantity', e.target.value)}
                />
              </label>
              <label>
                <span className="label">
                  {priceLabel}
                  {derived === 'fuelUnitPrice' && (
                    <span className="ml-1 text-xs text-ink-subtle">(auto)</span>
                  )}
                </span>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.fuelUnitPrice}
                  onChange={(e) => setFuelField('fuelUnitPrice', e.target.value)}
                />
              </label>
              <label>
                <span className="label">Odometer (km)</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={form.odometerKm}
                  onChange={(e) => set('odometerKm', e.target.value)}
                />
              </label>
            </div>
          </>
        );
      }
      case 'repair':
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="label">What was repaired?</span>
              <input
                className="input"
                placeholder="Brake pads replaced, front discs resurfaced"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </label>
            <label>
              <span className="label">Mechanic / shop</span>
              <input
                className="input"
                placeholder="Optional"
                value={form.mechanic}
                onChange={(e) => set('mechanic', e.target.value)}
              />
            </label>
          </div>
        );
      case 'parts':
        return (
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2">
              <span className="label">Part name</span>
              <input
                className="input"
                placeholder="Air filter, oil filter, headlight bulb…"
                value={form.partName}
                onChange={(e) => set('partName', e.target.value)}
              />
            </label>
            <label>
              <span className="label">Quantity</span>
              <input
                className="input"
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
              />
            </label>
          </div>
        );
      case 'inspection':
        return (
          <label className="block">
            <span className="label">Next inspection due (optional)</span>
            <input
              className="input"
              type="date"
              value={form.nextDueDate}
              onChange={(e) => set('nextDueDate', e.target.value)}
            />
          </label>
        );
      case 'other':
        return (
          <label className="block">
            <span className="label">What was this for?</span>
            <input
              className="input"
              placeholder="Car wash, road tax, parking, accessories…"
              value={form.otherDescription}
              onChange={(e) => set('otherDescription', e.target.value)}
            />
          </label>
        );
    }
  })();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={expense ? 'Edit expense' : 'Record an expense'}
      description="Pick a category — the form adapts to the fields that matter for that kind of cost."
      width="max-w-xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button
            type="submit"
            form="expense-form"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Saving…' : expense ? 'Save changes' : 'Add expense'}
          </button>
        </>
      }
    >
      <form id="expense-form" onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <span className="label">Category</span>
          <div role="tablist" className="grid grid-cols-5 gap-2">
            {(Object.keys(CATEGORY_LABEL) as ExpenseCategory[]).map((cat) => {
              const active = form.category === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  role="tab"
                  aria-selected={active}
                  onClick={() => set('category', cat)}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-colors ${
                    active
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-border bg-surface-muted text-ink-muted hover:border-brand/40'
                  }`}
                >
                  <span aria-hidden className="text-lg">
                    {CATEGORY_ICON[cat]}
                  </span>
                  {CATEGORY_LABEL[cat]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label>
            <span className="label">Car</span>
            <select
              className="input"
              value={form.carId}
              onChange={(e) => set('carId', e.target.value)}
            >
              <option value="" disabled>
                Select a car
              </option>
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.make} {c.model}
                  {c.licensePlate ? ` — ${c.licensePlate}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Date</span>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </label>
        </div>

        {categoryFields}

        <label>
          <span className="label">
            Total cost
            {form.category === 'fuel' &&
              form.fuelEditOrder.length === 2 &&
              !form.fuelEditOrder.includes('cost') && (
                <span className="ml-1 text-xs text-ink-subtle">(auto)</span>
              )}
          </span>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            value={form.cost}
            onChange={(e) =>
              form.category === 'fuel'
                ? setFuelField('cost', e.target.value)
                : set('cost', e.target.value)
            }
          />
        </label>

        <label>
          <span className="label">Note</span>
          <input
            className="input"
            placeholder="Optional context for this expense"
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
          />
        </label>
      </form>
    </Modal>
  );
}
