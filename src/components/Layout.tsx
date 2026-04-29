import { Outlet, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SideNavList, SideNavMenu } from './SideNav';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';
import { QuickAddMenu } from './QuickAddMenu';
import { QuickAddForms } from './QuickAddForms';

export function Layout() {
    return (
        <div className="flex min-h-screen flex-col bg-surface text-ink">
            <header className="sticky top-0 z-30 border-b border-border bg-surface-raised/80 backdrop-blur">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
                    <Link to="/" className="group" aria-label="CarTrack home">
                        <Logo size={32} className="transition-transform group-hover:-translate-y-0.5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <QuickAddMenu />
                        <ThemeToggle />
                        {/* Hamburger only on phones / tablets */}
                        <div className="md:hidden">
                            <SideNavMenu />
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 md:px-6">
                <aside className="hidden w-60 shrink-0 md:block">
                    <div className="card sticky top-20">
                        <SideNavList />
                    </div>
                </aside>

                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>

            <QuickAddForms />

            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'rounded-xl border border-border bg-surface-raised text-ink',
                }}
            />
        </div>
    );
}