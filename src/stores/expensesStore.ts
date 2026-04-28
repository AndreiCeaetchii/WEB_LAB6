import { create } from 'zustand';
import toast from 'react-hot-toast';
import { getDB } from '../lib/db';
import type { Expense, ExpenseInput, ID } from '../lib/types';

const newId = (): ID =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `exp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

interface ExpensesState {
  expenses: Expense[];
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  add: (input: ExpenseInput) => Promise<Expense>;
  update: (id: ID, patch: Partial<ExpenseInput>) => Promise<void>;
  remove: (id: ID) => Promise<void>;
  removeForCar: (carId: ID) => Promise<number>;
  byCar: (carId: ID) => Expense[];
  totalForCar: (carId: ID) => number;
}

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  expenses: [],
  loaded: false,
  loading: false,

  load: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const db = await getDB();
      const expenses = await db.getAll('expenses');
      expenses.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      set({ expenses, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  add: async (input) => {
    const db = await getDB();
    const now = Date.now();
    const expense = {
      ...input,
      id: newId(),
      cost: Number(input.cost) || 0,
      createdAt: now,
      updatedAt: now,
    } as Expense;
    await db.put('expenses', expense);
    set({ expenses: [expense, ...get().expenses] });
    toast.success('Expense recorded');
    return expense;
  },

  update: async (id, patch) => {
    const db = await getDB();
    const existing = await db.get('expenses', id);
    if (!existing) {
      toast.error('Expense not found');
      return;
    }
    const next = {
      ...existing,
      ...patch,
      cost:
        patch.cost !== undefined ? Number(patch.cost) || 0 : existing.cost,
      updatedAt: Date.now(),
    } as Expense;
    await db.put('expenses', next);
    set({
      expenses: get().expenses.map((e) => (e.id === id ? next : e)),
    });
    toast.success('Saved');
  },

  remove: async (id) => {
    const db = await getDB();
    await db.delete('expenses', id);
    set({ expenses: get().expenses.filter((e) => e.id !== id) });
    toast.success('Expense removed');
  },

  removeForCar: async (carId) => {
    const db = await getDB();
    const tx = db.transaction('expenses', 'readwrite');
    const idx = tx.store.index('by_carId');
    let count = 0;
    let cursor = await idx.openCursor(IDBKeyRange.only(carId));
    while (cursor) {
      await cursor.delete();
      count += 1;
      cursor = await cursor.continue();
    }
    await tx.done;
    if (count > 0) {
      set({ expenses: get().expenses.filter((e) => e.carId !== carId) });
    }
    return count;
  },

  byCar: (carId) => get().expenses.filter((e) => e.carId === carId),
  totalForCar: (carId) =>
    get().expenses
      .filter((e) => e.carId === carId)
      .reduce((sum, e) => sum + (Number(e.cost) || 0), 0),
}));
