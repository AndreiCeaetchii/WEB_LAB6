import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { CarForm } from '../components/CarForm';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseRow } from '../components/ExpenseRow';
import { DocumentForm } from '../components/DocumentForm';
import { DocumentRow } from '../components/DocumentRow';
import { PlusIcon, StarIcon } from '../components/icons';
import { getAccent, hexToRgbTuple } from '../lib/palette';
import { useObjectUrl } from '../lib/useObjectUrl';
import { formatMoney } from '../lib/format';
import { useCarsStore } from '../stores/carsStore';
import { useExpensesStore } from '../stores/expensesStore';
import { useDocumentsStore } from '../stores/documentsStore';
import type { DocumentKind, Expense, VehicleDocument } from '../lib/types';

export default function CarDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const carsLoaded = useCarsStore((s) => s.loaded);
  const loadCars = useCarsStore((s) => s.load);
  const remove = useCarsStore((s) => s.remove);
  const toggleFavorite = useCarsStore((s) => s.toggleFavorite);
  const car = useCarsStore((s) => s.getById(id));

  const expenses = useExpensesStore((s) => s.expenses);
  const expensesLoaded = useExpensesStore((s) => s.loaded);
  const loadExpenses = useExpensesStore((s) => s.load);
  const removeExpense = useExpensesStore((s) => s.remove);

  const documents = useDocumentsStore((s) => s.documents);
  const loadDocuments = useDocumentsStore((s) => s.load);
  const removeDocument = useDocumentsStore((s) => s.remove);
  const updateDocument = useDocumentsStore((s) => s.update);

  const [editOpen, setEditOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [docFormOpen, setDocFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] =
    useState<VehicleDocument | undefined>();
  const [docFormKind, setDocFormKind] = useState<DocumentKind>('rca');
  const photoUrl = useObjectUrl(car?.photo);

  useEffect(() => {
    void loadCars();
    void loadExpenses();
    void loadDocuments();
  }, [loadCars, loadExpenses, loadDocuments]);

  const accent = useMemo(() => (car ? getAccent(car.accentId) : undefined), [car]);
  const accentRgb = useMemo(() => (accent ? hexToRgbTuple(accent.hex) : '14 116 144'), [accent]);

  const carExpenses = useMemo(
    () => expenses.filter((e) => e.carId === id),
    [expenses, id],
  );
  const total = useMemo(
    () => carExpenses.reduce((sum, e) => sum + (Number(e.cost) || 0), 0),
    [carExpenses],
  );
  const carDocuments = useMemo(
    () => documents.filter((d) => d.carId === id),
    [documents, id],
  );

  if (carsLoaded && !car) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <h1 className="text-xl font-semibold">Car not found</h1>
        <p className="mt-2 text-sm text-ink-muted">
          It may have been removed. Pick another car from the garage.
        </p>
        <Link to="/garage" className="btn-primary mt-6 inline-flex">
          Back to Garage
        </Link>
      </div>
    );
  }

  if (!car) {
    return <div className="card grid place-items-center p-12 text-ink-muted">Loading…</div>;
  }

  const handleDelete = async () => {
    if (
      !confirm(
        `Remove ${car.make} ${car.model}? This will also delete all expenses recorded against this car.`,
      )
    )
      return;
    await remove(car.id);
    navigate('/garage');
  };

  const handleAddExpense = () => {
    setEditingExpense(undefined);
    setExpenseFormOpen(true);
  };
  const handleEditExpense = (e: Expense) => {
    setEditingExpense(e);
    setExpenseFormOpen(true);
  };
  const handleDeleteExpense = async (e: Expense) => {
    if (!confirm('Remove this expense?')) return;
    await removeExpense(e.id);
  };

  const handleAddDocument = (kind: DocumentKind) => {
    setEditingDocument(undefined);
    setDocFormKind(kind);
    setDocFormOpen(true);
  };
  const handleEditDocument = (doc: VehicleDocument) => {
    setEditingDocument(doc);
    setDocFormKind(doc.kind);
    setDocFormOpen(true);
  };
  const handleDeleteDocument = async (doc: VehicleDocument) => {
    if (!confirm('Remove this document and its photos?')) return;
    await removeDocument(doc.id);
  };
  const handleDocumentPhotosChange = async (
    doc: VehicleDocument,
    photos: Blob[],
  ) => {
    await updateDocument(doc.id, { photos });
  };

  return (
    <div style={{ ['--car-accent' as string]: accentRgb }}>
      <PageHeader
        title={`${car.make} ${car.model}`}
        description={`${car.year}${car.licensePlate ? ` · ${car.licensePlate}` : ''} · accent: ${accent?.label}`}
        actions={
          <>
            <button
              type="button"
              onClick={() => toggleFavorite(car.id)}
              className={`btn-outline ${car.favorite ? 'text-warn border-warn' : ''}`}
            >
              <StarIcon
                className="h-4 w-4"
                fill={car.favorite ? 'currentColor' : 'none'}
              />
              {car.favorite ? 'Favorited' : 'Favorite'}
            </button>
            <button type="button" onClick={() => setEditOpen(true)} className="btn-outline">
              Edit
            </button>
            <button type="button" onClick={handleDelete} className="btn-ghost text-danger">
              Delete
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="card overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${car.make} ${car.model}`}
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <div
              className="grid aspect-[4/3] place-items-center text-5xl font-semibold uppercase tracking-widest"
              style={{
                color: 'rgb(var(--car-accent))',
                background: 'rgb(var(--car-accent) / 0.1)',
              }}
            >
              {car.make.slice(0, 1)}
              {car.model.slice(0, 1)}
            </div>
          )}
        </div>

        <div className="card flex flex-col gap-4 p-6">
          <h2 className="text-base font-semibold">Vehicle details</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-subtle">Make</dt>
              <dd className="mt-1 font-medium">{car.make}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-subtle">Model</dt>
              <dd className="mt-1 font-medium">{car.model}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-subtle">Year</dt>
              <dd className="mt-1 font-medium">{car.year}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-subtle">Plate</dt>
              <dd className="mt-1 font-medium">{car.licensePlate || '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs uppercase tracking-wide text-ink-subtle">VIN</dt>
              <dd className="mt-1 font-mono text-sm">{car.vin || '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs uppercase tracking-wide text-ink-subtle">Total spent</dt>
              <dd
                className="mt-1 font-display text-2xl font-medium tabular-nums"
                style={{ color: 'rgb(var(--car-accent))' }}
              >
                {expensesLoaded ? formatMoney(total) : '—'}
              </dd>
              <p className="mt-1 text-xs text-ink-subtle">
                {carExpenses.length} expense{carExpenses.length === 1 ? '' : 's'} recorded
              </p>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-medium tracking-tight">Expenses</h2>
            <p className="text-sm text-ink-muted">
              Fuel, repairs, parts, and inspection records for this car.
            </p>
          </div>
          <button type="button" onClick={handleAddExpense} className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            Record expense
          </button>
        </div>
        {!expensesLoaded ? (
          <div className="card grid place-items-center p-8 text-ink-muted">Loading…</div>
        ) : carExpenses.length === 0 ? (
          <div className="card p-8 text-center text-sm text-ink-muted">
            No expenses recorded for this car yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {carExpenses.map((e) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                car={car}
                onEdit={() => handleEditExpense(e)}
                onDelete={() => handleDeleteExpense(e)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-medium tracking-tight">Documents</h2>
            <p className="text-sm text-ink-muted">
              RCA insurance and Cartea Verde with multi-photo gallery.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleAddDocument('rca')}
              className="btn-outline"
            >
              <PlusIcon className="h-4 w-4" />
              Add RCA
            </button>
            <button
              type="button"
              onClick={() => handleAddDocument('cartea-verde')}
              className="btn-outline"
            >
              <PlusIcon className="h-4 w-4" />
              Add Cartea Verde
            </button>
          </div>
        </div>
        {carDocuments.length === 0 ? (
          <div className="card p-8 text-center text-sm text-ink-muted">
            No documents on file for this car yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {carDocuments.map((d) => (
              <DocumentRow
                key={d.id}
                document={d}
                car={car}
                onEdit={() => handleEditDocument(d)}
                onDelete={() => handleDeleteDocument(d)}
                onPhotosChange={(photos) => handleDocumentPhotosChange(d, photos)}
              />
            ))}
          </div>
        )}
      </section>

      <CarForm open={editOpen} onClose={() => setEditOpen(false)} car={car} />
      <ExpenseForm
        open={expenseFormOpen}
        onClose={() => setExpenseFormOpen(false)}
        expense={editingExpense}
        defaultCarId={car.id}
      />
      <DocumentForm
        open={docFormOpen}
        onClose={() => setDocFormOpen(false)}
        kind={docFormKind}
        document={editingDocument}
        defaultCarId={car.id}
      />
    </div>
  );
}
