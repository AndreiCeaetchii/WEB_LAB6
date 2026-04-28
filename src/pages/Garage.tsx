import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { CarCard } from '../components/CarCard';
import { CarForm } from '../components/CarForm';
import { EmptyState } from '../components/EmptyState';
import { GarageIcon, PlusIcon } from '../components/icons';
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

  useEffect(() => {
    void load();
  }, [load]);

  const sortedCars = [...cars].sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    return b.createdAt - a.createdAt;
  });

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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedCars.map((car) => (
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

      <CarForm open={formOpen} onClose={() => setFormOpen(false)} car={editing} />
    </>
  );
}
