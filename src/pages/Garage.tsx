import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { CarCard } from '../components/CarCard';
import { CarForm } from '../components/CarForm';
import { EmptyState } from '../components/EmptyState';
import { GarageIcon, PlusIcon, StarIcon } from '../components/icons';
import { useCarsStore } from '../stores/carsStore';
import type { Car } from '../lib/types';

export default function GaragePage() {
  const cars = useCarsStore((s) => s.cars);
  const loaded = useCarsStore((s) => s.loaded);
  const load = useCarsStore((s) => s.load);
  const remove = useCarsStore((s) => s.remove);
  const toggleFavorite = useCarsStore((s) => s.toggleFavorite);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Car | undefined>(undefined);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void load();
  }, [load]);

  const filteredCars = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cars
      .filter((c) => {
        if (favoritesOnly && !c.favorite) return false;
        if (!q) return true;
        const haystack =
          `${c.make} ${c.model} ${c.licensePlate} ${c.vin}`.toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
        return b.createdAt - a.createdAt;
      });
  }, [cars, favoritesOnly, search]);

  const handleAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const handleEdit = (car: Car) => {
    setEditing(car);
    setFormOpen(true);
  };

  const handleDelete = async (car: Car) => {
    if (!confirm(`Remove ${car.make} ${car.model}? This cannot be undone.`)) return;
    await remove(car.id);
  };

  return (
    <>
      <PageHeader
        title="Garage"
        description="Cars in your fleet. Mark a daily driver as favorite to pin it to the top."
        actions={
          <button type="button" onClick={handleAdd} className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            Add car
          </button>
        }
      />

      {!loaded ? (
        <div className="card grid place-items-center p-12 text-ink-muted">Loading…</div>
      ) : cars.length === 0 ? (
        <EmptyState
          icon={<GarageIcon className="h-7 w-7" />}
          title="Your garage is empty"
          description="Add your first car to start tracking expenses, insurance, and Cartea Verde."
          action={
            <button type="button" onClick={handleAdd} className="btn-primary">
              <PlusIcon className="h-4 w-4" />
              Add a car
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <label className="relative flex-1 min-w-[200px]">
              <span className="sr-only">Search cars</span>
              <input
                type="search"
                placeholder="Search by make, model, plate, or VIN"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
              >
                🔍
              </span>
            </label>
            <button
              type="button"
              onClick={() => setFavoritesOnly((v) => !v)}
              className={`chip cursor-pointer ${
                favoritesOnly
                  ? 'border-warn bg-warn/10 text-warn'
                  : 'hover:border-brand/40'
              }`}
            >
              <StarIcon
                className="h-3.5 w-3.5"
                fill={favoritesOnly ? 'currentColor' : 'none'}
              />
              Favorites only
            </button>
            <span className="text-xs text-ink-subtle">
              {filteredCars.length} of {cars.length} cars
            </span>
          </div>

          {filteredCars.length === 0 ? (
            <div className="card p-8 text-center text-sm text-ink-muted">
              No cars match the current filters.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  onEdit={() => handleEdit(car)}
                  onDelete={() => handleDelete(car)}
                  onToggleFavorite={() => toggleFavorite(car.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <CarForm open={formOpen} onClose={() => setFormOpen(false)} car={editing} />
    </>
  );
}
