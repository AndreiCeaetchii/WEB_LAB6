import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/PageHeader';
import { useTheme } from '../lib/theme';
import {
  downloadBackup,
  restoreBackup,
  wipeAllData,
  type CarTrackBackup,
} from '../lib/backup';
import { useCarsStore } from '../stores/carsStore';
import { useExpensesStore } from '../stores/expensesStore';
import { useDocumentsStore } from '../stores/documentsStore';

export default function SettingsPage() {
  const { mode, setMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'export' | 'import' | 'wipe' | null>(null);

  const reloadStores = async () => {
    await Promise.all([
      reloadStore(useCarsStore),
      reloadStore(useExpensesStore),
      reloadStore(useDocumentsStore),
    ]);
  };

  const handleExport = async () => {
    setBusy('export');
    try {
      await downloadBackup();
      toast.success('Backup downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Could not export');
    } finally {
      setBusy(null);
    }
  };

  const handleImport = async (file: File) => {
    setBusy('import');
    try {
      const text = await file.text();
      const data = JSON.parse(text) as CarTrackBackup;
      const counts = await restoreBackup(data);
      await reloadStores();
      toast.success(
        `Restored ${counts.cars} cars, ${counts.expenses} expenses, ${counts.documents} documents`,
      );
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Could not import');
    } finally {
      setBusy(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleWipe = async () => {
    if (
      !confirm(
        'This will permanently delete every car, expense, and document. Continue?',
      )
    )
      return;
    setBusy('wipe');
    try {
      await wipeAllData();
      await reloadStores();
      toast.success('All data wiped');
    } catch (err) {
      console.error(err);
      toast.error('Could not wipe data');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Theme preference, JSON backup, and a danger zone for starting fresh."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card flex flex-col gap-3 p-6">
          <h2 className="font-display text-lg font-medium">Theme</h2>
          <p className="text-sm text-ink-muted">
            CarTrack remembers your preference; it falls back to your system theme on first
            visit.
          </p>
          <div className="flex flex-wrap gap-2">
            {(['light', 'dark'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`btn ${
                  mode === m ? 'btn-primary' : 'btn-outline'
                }`}
              >
                {m === 'light' ? '☀' : '☾'} {m === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
        </section>

        <section className="card flex flex-col gap-3 p-6">
          <h2 className="font-display text-lg font-medium">Backup &amp; restore</h2>
          <p className="text-sm text-ink-muted">
            Export everything — cars, expenses, documents, and photos — into a JSON file
            you can keep on your phone or another device. Importing replaces your current
            data.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={busy !== null}
              className="btn-primary"
            >
              {busy === 'export' ? 'Exporting…' : 'Export JSON'}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy !== null}
              className="btn-outline"
            >
              {busy === 'import' ? 'Importing…' : 'Import JSON'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleImport(f);
              }}
            />
          </div>
        </section>

        <section className="card flex flex-col gap-3 border-danger/30 p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-medium text-danger">Danger zone</h2>
          <p className="text-sm text-ink-muted">
            Wipe every car, expense, and document from this device. This cannot be undone.
            Export a backup first if you want to keep anything.
          </p>
          <div>
            <button
              type="button"
              onClick={handleWipe}
              disabled={busy !== null}
              className="btn border border-danger/50 bg-danger/10 text-danger hover:bg-danger/15"
            >
              {busy === 'wipe' ? 'Wiping…' : 'Wipe all data'}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

interface ReloadableStore {
  getState(): {
    loaded: boolean;
    loading: boolean;
    load: () => Promise<void>;
  };
  setState(partial: { loaded: boolean }): void;
}

async function reloadStore(store: ReloadableStore): Promise<void> {
  store.setState({ loaded: false });
  await store.getState().load();
}
