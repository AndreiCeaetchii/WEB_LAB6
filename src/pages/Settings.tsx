import { PageHeader } from '../components/PageHeader';
import { useTheme } from '../lib/theme';

export default function SettingsPage() {
  const { mode, setMode } = useTheme();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Theme preference."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card flex flex-col gap-3 p-6">
          <h2 className="font-display text-lg font-medium">Theme</h2>
          <p className="text-sm text-ink-muted">
            CarTrack remembers your preference; it falls back to your system theme on first visit.
          </p>
          <div className="flex flex-wrap gap-2">
            {(['light', 'dark'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`btn ${mode === m ? 'btn-primary' : 'btn-outline'}`}
              >
                {m === 'light' ? '☀' : '☾'} {m === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
