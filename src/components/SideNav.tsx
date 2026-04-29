import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  DashboardIcon,
  ExpenseIcon,
  GarageIcon,
  GreenCardIcon,
  MenuIcon,
  SettingsIcon,
  ShieldIcon,
} from './icons';
import type { ComponentType, SVGProps } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon },
  { to: '/garage', label: 'Garage', icon: GarageIcon },
  { to: '/expenses', label: 'Expenses', icon: ExpenseIcon },
  { to: '/insurance', label: 'Insurance', icon: ShieldIcon },
  { to: '/cartea-verde', label: 'Cartea Verde', icon: GreenCardIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

interface SideNavListProps {
  onNavigate?: () => void;
}

/**
 * The bare list of nav links. Used by both the persistent desktop sidebar and
 * the mobile dropdown so styling/items stay in sync.
 */
export function SideNavList({ onNavigate }: SideNavListProps) {
  return (
      <nav className="flex flex-col gap-1 p-1.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                          ? 'bg-brand text-brand-contrast'
                          : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                    ].join(' ')
                }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </NavLink>
        ))}
      </nav>
  );
}

/**
 * Hamburger trigger + dropdown popover. Used only on phones / tablets.
 */
export function SideNavMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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

  return (
      <div className="relative">
        <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Open navigation menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        {open && (
            <div
                ref={menuRef}
                role="menu"
                className="card absolute right-0 top-12 z-40 w-60 overflow-hidden p-1.5 shadow-card"
            >
              <SideNavList onNavigate={() => setOpen(false)} />
            </div>
        )}
      </div>
  );
}

/**
 * Backwards-compatible default export, in case anything still imports
 * `SideNav`. Renders the bare list (same as the desktop sidebar body).
 */
export function SideNav() {
  return <SideNavList />;
}