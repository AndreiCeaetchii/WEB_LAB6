import { create } from 'zustand';
import toast from 'react-hot-toast';
import { getDB } from '../lib/db';
import { pickNextAccent } from '../lib/palette';
import { useExpensesStore } from './expensesStore';
import { useDocumentsStore } from './documentsStore';
import type { Car, CarInput, ID } from '../lib/types';

const newId = (): ID =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `car_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

interface CarsState {
  cars: Car[];
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  add: (input: CarInput) => Promise<Car>;
  update: (id: ID, patch: Partial<CarInput>) => Promise<void>;
  remove: (id: ID) => Promise<void>;
  toggleFavorite: (id: ID) => Promise<void>;
  getById: (id: ID) => Car | undefined;
}

export const useCarsStore = create<CarsState>((set, get) => ({
  cars: [],
  loaded: false,
  loading: false,

  load: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const db = await getDB();
      const cars = await db.getAll('cars');
      cars.sort((a, b) => b.createdAt - a.createdAt);
      set({ cars, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  add: async (input) => {
    const db = await getDB();
    const usedAccentIds = get().cars.map((c) => c.accentId);
    const accent = pickNextAccent(usedAccentIds);
    const now = Date.now();
    const car: Car = {
      id: newId(),
      make: input.make.trim(),
      model: input.model.trim(),
      year: input.year,
      vin: input.vin.trim(),
      licensePlate: input.licensePlate.trim(),
      photo: input.photo,
      isElectric: input.isElectric ?? false,
      accentId: accent.id,
      favorite: input.favorite ?? false,
      createdAt: now,
      updatedAt: now,
    };
    await db.put('cars', car);
    set({ cars: [car, ...get().cars] });
    toast.success(`Added ${car.make} ${car.model}`);
    return car;
  },

  update: async (id, patch) => {
    const db = await getDB();
    const existing = await db.get('cars', id);
    if (!existing) {
      toast.error('Car not found');
      return;
    }
    const next: Car = {
      ...existing,
      ...patch,
      make: patch.make !== undefined ? patch.make.trim() : existing.make,
      model: patch.model !== undefined ? patch.model.trim() : existing.model,
      vin: patch.vin !== undefined ? patch.vin.trim() : existing.vin,
      licensePlate:
        patch.licensePlate !== undefined ? patch.licensePlate.trim() : existing.licensePlate,
      updatedAt: Date.now(),
    };
    await db.put('cars', next);
    set({ cars: get().cars.map((c) => (c.id === id ? next : c)) });
    toast.success('Saved');
  },

  remove: async (id) => {
    const db = await getDB();
    await db.delete('cars', id);
    set({ cars: get().cars.filter((c) => c.id !== id) });
    const expensesRemoved = await useExpensesStore.getState().removeForCar(id);
    const documentsRemoved = await useDocumentsStore.getState().removeForCar(id);
    const cleaned: string[] = [];
    if (expensesRemoved > 0) cleaned.push(`${expensesRemoved} expense${expensesRemoved === 1 ? '' : 's'}`);
    if (documentsRemoved > 0) cleaned.push(`${documentsRemoved} document${documentsRemoved === 1 ? '' : 's'}`);
    toast.success(
      cleaned.length ? `Car removed (${cleaned.join(', ')} cleared)` : 'Car removed',
    );
  },

  toggleFavorite: async (id) => {
    const db = await getDB();
    const existing = await db.get('cars', id);
    if (!existing) return;
    const next: Car = { ...existing, favorite: !existing.favorite, updatedAt: Date.now() };
    await db.put('cars', next);
    set({ cars: get().cars.map((c) => (c.id === id ? next : c)) });
  },

  getById: (id) => get().cars.find((c) => c.id === id),
}));
