import { NavLink } from 'react-router-dom';
import {
  DashboardIcon,
  ExpenseIcon,
  GarageIcon,
  GreenCardIcon,
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

export function SideNav() {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
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
