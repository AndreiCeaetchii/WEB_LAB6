import { useRef, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useTheme } from '../lib/theme';
import { api } from '../lib/api';
import { useCarsStore } from '../stores/carsStore';
import { useExpensesStore } from '../stores/expensesStore';
import { useDocumentsStore } from '../stores/documentsStore';

interface ImportResult {
  carsImported: number;
  expensesImported: number;
  documentsImported: number;
}

type ImportState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'success'; result: ImportResult }
  | { status: 'error'; message: string };

export default function SettingsPage() {
  const { mode, setMode } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importState, setImportState] = useState<ImportState>({ status: 'idle' });
  const invalidateCars = useCarsStore((s) => s.invalidate);
  const invalidateExpenses = useExpensesStore((s) => s.invalidate);
  const invalidateDocuments = useDocumentsStore((s) => s.invalidate);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setImportState({ status: 'idle' });
  };

  const handleImport = async () => {
    if (!file) return;
    setImportState({ status: 'uploading' });
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post<ImportResult>('/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      invalidateCars();
      invalidateExpenses();
      invalidateDocuments();
      setImportState({ status: 'success', result: data });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Import failed. Make sure the file is a valid CarTrack backup.';
      setImportState({ status: 'error', message });
    }
  };

  return (
    <>
      <PageHeader title="Settings" description="Theme preference and data import." />
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

        <section className="card flex flex-col gap-3 p-6">
          <h2 className="font-display text-lg font-medium">Import backup</h2>
          <p className="text-sm text-ink-muted">
            Upload a JSON backup exported from the Lab 6 offline app to migrate your cars,
            expenses, and documents.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn-outline cursor-pointer">
              {file ? file.name : 'Choose file…'}
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>
            <button
              type="button"
              onClick={handleImport}
              disabled={!file || importState.status === 'uploading'}
              className="btn-primary disabled:opacity-50"
            >
              {importState.status === 'uploading' ? 'Importing…' : 'Import'}
            </button>
          </div>
          {importState.status === 'success' && (
            <p className="text-sm text-success">
              Imported {importState.result.carsImported} car
              {importState.result.carsImported !== 1 ? 's' : ''},&nbsp;
              {importState.result.expensesImported} expense
              {importState.result.expensesImported !== 1 ? 's' : ''},&nbsp;
              {importState.result.documentsImported} document
              {importState.result.documentsImported !== 1 ? 's' : ''}.
            </p>
          )}
          {importState.status === 'error' && (
            <p className="text-sm text-danger">{importState.message}</p>
          )}
        </section>
      </div>
    </>
  );
}
