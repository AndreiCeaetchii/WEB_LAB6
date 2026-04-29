import { useMemo, type ComponentType, type SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { getAccent, hexToRgbTuple } from '../lib/palette';
import { formatDate, formatMoney } from '../lib/format';
import type { Car, Expense } from '../lib/types';
import {
  FuelPumpIcon,
  BoltIcon,
  WrenchIcon,
  CogwheelIcon,
  ShieldIcon,
  SparkleIcon,
} from '../assets/icons';

interface ExpenseRowProps {
  expense: Expense;
  car?: Car;
  onEdit: () => void;
  onDelete: () => void;
}

const CATEGORY_LABEL: Record<Expense['category'], string> = {
  fuel: 'Fuel',
  repair: 'Repair',
  parts: 'Parts',
  inspection: 'Inspection',
  other: 'Other',
};

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const CATEGORY_ICON: Record<Expense['category'], Icon> = {
  fuel: FuelPumpIcon,
  repair: WrenchIcon,
  parts: CogwheelIcon,
  inspection: ShieldIcon,
  other: SparkleIcon,
};

function iconFor(e: Expense): Icon {
  if (e.category === 'fuel' && e.unit === 'kWh') return BoltIcon;
  return CATEGORY_ICON[e.category];
}

function describe(e: Expense): string {
  switch (e.category) {
    case 'fuel':
      return `${e.quantity.toLocaleString()} ${e.unit} · ${formatMoney(e.unitPrice)} / ${e.unit}${
        e.odometerKm !== undefined ? ` · ${e.odometerKm.toLocaleString()} km` : ''
      }`;
    case 'repair':
      return e.mechanic ? `${e.description} · ${e.mechanic}` : e.description;
    case 'parts':
      return `${e.partName}${e.quantity > 1 ? ` × ${e.quantity}` : ''}`;
    case 'inspection':
      return e.nextDueDate ? `Next due ${formatDate(e.nextDueDate)}` : 'Technical inspection';
    case 'other':
      return e.description;
  }
}

export function ExpenseRow({ expense, car, onEdit, onDelete }: ExpenseRowProps) {
  const accent = useMemo(
    () => (car ? getAccent(car.accentId) : undefined),
    [car],
  );
  const accentRgb = useMemo(
    () => (accent ? hexToRgbTuple(accent.hex) : '14 116 144'),
    [accent],
  );
  const Icon = iconFor(expense);

  return (
    <article
      className="card flex flex-wrap items-center gap-3 p-4"
      style={{ ['--car-accent' as string]: accentRgb }}
    >
      <span
        aria-hidden
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{
          color: 'rgb(var(--car-accent))',
          background: 'rgb(var(--car-accent) / 0.12)',
        }}
      >
        <Icon width={20} height={20} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-medium">
            {CATEGORY_LABEL[expense.category]}
          </span>
          {car ? (
            <Link
              to={`/garage/${car.id}`}
              className="text-sm text-ink-muted hover:underline"
            >
              {car.make} {car.model}
              {car.licensePlate ? ` · ${car.licensePlate}` : ''}
            </Link>
          ) : (
            <span className="text-sm text-ink-subtle">Unknown car</span>
          )}
          <span className="text-xs text-ink-subtle">{formatDate(expense.date)}</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-ink-muted">{describe(expense)}</p>
        {expense.note && (
          <p className="mt-1 truncate text-xs text-ink-subtle">{expense.note}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-base font-semibold tabular-nums">
          {formatMoney(expense.cost)}
        </span>
        <button type="button" onClick={onEdit} className="btn-ghost">
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="btn-ghost text-danger hover:bg-danger/10"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
