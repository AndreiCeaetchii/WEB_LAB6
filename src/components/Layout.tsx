import { Outlet, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SideNav } from './SideNav';
import { ThemeToggle } from './ThemeToggle';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      <header className="sticky top-0 z-30 border-b border-border bg-surface-raised/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-brand-contrast"
            >
              ⛽
            </span>
            <span>CarTrack</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 md:px-6">
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="card sticky top-20">
            <SideNav />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      <nav className="sticky bottom-0 z-20 border-t border-border bg-surface-raised md:hidden">
        <SideNav />
      </nav>

      <Toaster
        position="top-right"
        toastOptions={{
          className: 'rounded-xl border border-border bg-surface-raised text-ink',
        }}
      />
    </div>
  );
}
