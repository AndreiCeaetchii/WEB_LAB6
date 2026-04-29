import type { Car, Expense } from './types';
import { getAccent } from './palette';

export interface SpendPerCar {
  carId: string;
  carName: string;
  hex: string;
  total: number;
}

export function spendPerCar(cars: Car[], expenses: Expense[]): SpendPerCar[] {
  const totals = new Map<string, number>();
  for (const e of expenses) {
    totals.set(e.carId, (totals.get(e.carId) ?? 0) + (Number(e.cost) || 0));
  }
  return cars
    .map((c) => ({
      carId: c.id,
      carName: `${c.make} ${c.model}`,
      hex: getAccent(c.accentId).hex,
      total: totals.get(c.id) ?? 0,
    }))
    .filter((s) => s.total > 0)
    .sort((a, b) => b.total - a.total);
}

export interface MonthlyBucket {
  /** ISO yyyy-mm */
  month: string;
  label: string;
  total: number;
}

export function monthlyTrend(expenses: Expense[], months = 12): MonthlyBucket[] {
  const now = new Date();
  const buckets: MonthlyBucket[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-US', { month: 'short' });
    buckets.push({ month, label, total: 0 });
  }
  const idx = new Map(buckets.map((b, i) => [b.month, i] as const));
  for (const e of expenses) {
    const month = e.date.slice(0, 7);
    const i = idx.get(month);
    if (i !== undefined) {
      buckets[i].total += Number(e.cost) || 0;
    }
  }
  return buckets;
}

export function topCategory(expenses: Expense[]): {
  category: Expense['category'];
  total: number;
} | null {
  if (expenses.length === 0) return null;
  const totals = new Map<Expense['category'], number>();
  for (const e of expenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + (Number(e.cost) || 0));
  }
  let best: { category: Expense['category']; total: number } | null = null;
  for (const [category, total] of totals) {
    if (!best || total > best.total) best = { category, total };
  }
  return best;
}
