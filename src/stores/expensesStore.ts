import { create } from 'zustand';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { mapExpenseDto, mapExpenseToInput, type ApiExpenseDto } from '../lib/expenseMapper';
import { useCarsStore } from './carsStore';
import type { Expense, ExpenseInput, ID } from '../lib/types';

interface PaginatedResult<T> { items: T[]; total: number; page: number; pageSize: number; }

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
      if (!useCarsStore.getState().loaded) {
        await useCarsStore.getState().load();
      }
      const cars = useCarsStore.getState().cars;
      const results = await Promise.all(
        cars.map((car) =>
          api
            .get<PaginatedResult<ApiExpenseDto>>(`/cars/${car.id}/expenses?pageSize=1000`)
            .then((r) => r.data.items.map(mapExpenseDto)),
        ),
      );
      const expenses = results.flat();
      expenses.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      set({ expenses, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  add: async (input) => {
    const body = mapExpenseToInput(input as Expense);
    const { data } = await api.post<ApiExpenseDto>(
      `/cars/${input.carId}/expenses`,
      body,
    );
    const expense = mapExpenseDto(data);
    set({ expenses: [expense, ...get().expenses] });
    toast.success('Expense recorded');
    return expense;
  },

  update: async (id, patch) => {
    const existing = get().expenses.find((e) => e.id === id);
    if (!existing) { toast.error('Expense not found'); return; }
    const merged = { ...existing, ...patch } as Expense;
    const body = mapExpenseToInput(merged);
    const { data } = await api.put<ApiExpenseDto>(
      `/cars/${existing.carId}/expenses/${id}`,
      body,
    );
    const updated = mapExpenseDto(data);
    set({ expenses: get().expenses.map((e) => (e.id === id ? updated : e)) });
    toast.success('Saved');
  },

  remove: async (id) => {
    const existing = get().expenses.find((e) => e.id === id);
    if (!existing) return;
    await api.delete(`/cars/${existing.carId}/expenses/${id}`);
    set({ expenses: get().expenses.filter((e) => e.id !== id) });
    toast.success('Expense removed');
  },

  removeForCar: async (carId) => {
    const count = get().expenses.filter((e) => e.carId === carId).length;
    set({ expenses: get().expenses.filter((e) => e.carId !== carId) });
    return count;
  },

  byCar: (carId) => get().expenses.filter((e) => e.carId === carId),
  totalForCar: (carId) =>
    get().expenses
      .filter((e) => e.carId === carId)
      .reduce((sum, e) => sum + (Number(e.cost) || 0), 0),
}));
