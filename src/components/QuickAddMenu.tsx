import { useEffect, useRef, useState } from 'react';
import { useUIStore } from '../stores/uiStore';
import {
  GarageIcon,
  ExpenseIcon,
  GreenCardIcon,
  PlusIcon,
  ShieldIcon,
} from './icons';

interface MenuItem {
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
}

export function QuickAddMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openCar = useUIStore((s) => s.openCar);
  const openExpense = useUIStore((s) => s.openExpense);
  const openDocument = useUIStore((s) => s.openDocument);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const items: MenuItem[] = [
    {
      label: 'Add car',
      hint: 'Make, model, plate, photo',
      icon: GarageIcon,
      onSelect: () => {
        openCar();
        setOpen(false);
      },
    },
    {
      label: 'Record expense',
      hint: 'Fuel, repair, parts, etc.',
      icon: ExpenseIcon,
      onSelect: () => {
        openExpense();
        setOpen(false);
      },
    },
    {
      label: 'Add RCA insurance',
      hint: 'Local liability policy',
      icon: ShieldIcon,
      onSelect: () => {
        openDocument('rca');
        setOpen(false);
      },
    },
    {
      label: 'Add Cartea Verde',
      hint: 'International coverage',
      icon: GreenCardIcon,
      onSelect: () => {
        openDocument('cartea-verde');
        setOpen(false);
      },
    },
  ];

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="btn-primary h-10 gap-1.5 px-3 text-sm"
      >
        <PlusIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Quick add</span>
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="card absolute right-0 top-12 z-40 w-72 overflow-hidden p-1.5 shadow-card"
        >
          {items.map(({ label, hint, icon: Icon, onSelect }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={onSelect}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-muted"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ink">{label}</span>
                <span className="block text-xs text-ink-muted">{hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
