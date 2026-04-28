import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from './PageHeader';
import { EmptyState } from './EmptyState';
import { DocumentForm } from './DocumentForm';
import { DocumentRow } from './DocumentRow';
import { PlusIcon, ShieldIcon, GreenCardIcon } from './icons';
import { useCarsStore } from '../stores/carsStore';
import { useDocumentsStore } from '../stores/documentsStore';
import { getStatus } from '../lib/validity';
import type { DocumentKind, DocumentStatus, VehicleDocument } from '../lib/types';

interface DocumentListProps {
  kind: DocumentKind;
  title: string;
  description: string;
}

const STATUS_FILTERS: Array<DocumentStatus | 'all'> = [
  'all',
  'active',
  'expiring',
  'expired',
];

const STATUS_LABEL: Record<DocumentStatus | 'all', string> = {
  all: 'All',
  active: 'Active',
  expiring: 'Expiring soon',
  expired: 'Expired',
};

export function DocumentList({ kind, title, description }: DocumentListProps) {
  const cars = useCarsStore((s) => s.cars);
  const carsLoaded = useCarsStore((s) => s.loaded);
  const loadCars = useCarsStore((s) => s.load);
  const docs = useDocumentsStore((s) => s.documents);
  const docsLoaded = useDocumentsStore((s) => s.loaded);
  const loadDocs = useDocumentsStore((s) => s.load);
  const remove = useDocumentsStore((s) => s.remove);
  const update = useDocumentsStore((s) => s.update);

  useEffect(() => {
    void loadCars();
    void loadDocs();
  }, [loadCars, loadDocs]);

  const [statusFilter, setStatusFilter] =
    useState<DocumentStatus | 'all'>('all');
  const [editing, setEditing] = useState<VehicleDocument | undefined>();
  const [formOpen, setFormOpen] = useState(false);

  const carsById = useMemo(
    () => new Map(cars.map((c) => [c.id, c] as const)),
    [cars],
  );

  const docsForKind = useMemo(
    () => docs.filter((d) => d.kind === kind),
    [docs, kind],
  );

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return docsForKind;
    return docsForKind.filter((d) => getStatus(d.endDate) === statusFilter);
  }, [docsForKind, statusFilter]);

  const handleAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const handleEdit = (doc: VehicleDocument) => {
    setEditing(doc);
    setFormOpen(true);
  };

  const handleDelete = async (doc: VehicleDocument) => {
    if (!confirm('Remove this document and its photos?')) return;
    await remove(doc.id);
  };

  const handlePhotosChange = async (doc: VehicleDocument, photos: Blob[]) => {
    await update(doc.id, { photos });
  };

  const ready = carsLoaded && docsLoaded;
  const Icon = kind === 'rca' ? ShieldIcon : GreenCardIcon;

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <button
            type="button"
            onClick={handleAdd}
            disabled={cars.length === 0}
            className="btn-primary"
            title={cars.length === 0 ? 'Add a car first' : undefined}
          >
            <PlusIcon className="h-4 w-4" />
            Add {kind === 'rca' ? 'RCA' : 'Cartea Verde'}
          </button>
        }
      />

      {!ready ? (
        <div className="card grid place-items-center p-12 text-ink-muted">Loading…</div>
      ) : cars.length === 0 ? (
        <EmptyState
          icon={<Icon className="h-7 w-7" />}
          title="Add a car first"
          description="Documents are linked to a specific car. Add one in the garage and come back."
        />
      ) : docsForKind.length === 0 ? (
        <EmptyState
          icon={<Icon className="h-7 w-7" />}
          title={`No ${title.toLowerCase()} on file`}
          description="Track validity, store photos of the policy, and get an alert before it expires."
          action={
            <button type="button" onClick={handleAdd} className="btn-primary">
              <PlusIcon className="h-4 w-4" />
              Add your first one
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
              Status
            </span>
            {STATUS_FILTERS.map((st) => (
              <button
                type="button"
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`chip cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'hover:border-brand/40'
                }`}
              >
                {STATUS_LABEL[st]}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="card p-8 text-center text-sm text-ink-muted">
              Nothing matches that filter.
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((d) => (
                <DocumentRow
                  key={d.id}
                  document={d}
                  car={carsById.get(d.carId)}
                  onEdit={() => handleEdit(d)}
                  onDelete={() => handleDelete(d)}
                  onPhotosChange={(photos) => handlePhotosChange(d, photos)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <DocumentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        kind={kind}
        document={editing}
      />
    </>
  );
}
