import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { CarForm } from '../components/CarForm';
import { StarIcon } from '../components/icons';
import { getAccent, hexToRgbTuple } from '../lib/palette';
import { useObjectUrl } from '../lib/useObjectUrl';
import { useCarsStore } from '../stores/carsStore';

export default function CarDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const loaded = useCarsStore((s) => s.loaded);
  const load = useCarsStore((s) => s.load);
  const remove = useCarsStore((s) => s.remove);
  const toggleFavorite = useCarsStore((s) => s.toggleFavorite);
  const car = useCarsStore((s) => s.getById(id));

  const [editOpen, setEditOpen] = useState(false);
  const photoUrl = useObjectUrl(car?.photo);

  useEffect(() => {
    void load();
  }, [load]);

  const accent = useMemo(() => (car ? getAccent(car.accentId) : undefined), [car]);
  const accentRgb = useMemo(() => (accent ? hexToRgbTuple(accent.hex) : '14 116 144'), [accent]);

  if (loaded && !car) {
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
    if (!confirm(`Remove ${car.make} ${car.model}? This cannot be undone.`)) return;
    await remove(car.id);
    navigate('/garage');
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
              <dt className="text-xs uppercase tracking-wide text-ink-subtle">Added</dt>
              <dd className="mt-1 text-sm text-ink-muted">
                {new Date(car.createdAt).toLocaleString()}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-ink-muted">
            Expenses and document tabs land in the next PRs — once they ship, this page becomes the
            single-car drilldown.
          </p>
        </div>
      </div>

      <CarForm open={editOpen} onClose={() => setEditOpen(false)} car={car} />
    </div>
  );
}
