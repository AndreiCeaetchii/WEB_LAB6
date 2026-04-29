import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type { Car, Expense, VehicleDocument } from './types';

export const DB_NAME = 'cartrack';
export const DB_VERSION = 5;

export interface CarTrackDB extends DBSchema {
  cars: {
    key: string;
    value: Car;
    indexes: {
      by_createdAt: number;
    };
  };
  expenses: {
    key: string;
    value: Expense;
    indexes: {
      by_carId: string;
      by_category: string;
      by_date: string;
    };
  };
  documents: {
    key: string;
    value: VehicleDocument;
    indexes: {
      by_carId: string;
      by_kind: string;
      by_endDate: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<CarTrackDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<CarTrackDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CarTrackDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, tx) {
        if (oldVersion < 2) {
          const cars = db.createObjectStore('cars', { keyPath: 'id' });
          cars.createIndex('by_createdAt', 'createdAt');
        }
        if (oldVersion < 3) {
          const expenses = db.createObjectStore('expenses', { keyPath: 'id' });
          expenses.createIndex('by_carId', 'carId');
          expenses.createIndex('by_category', 'category');
          expenses.createIndex('by_date', 'date');
        }
        if (oldVersion < 4) {
          const documents = db.createObjectStore('documents', { keyPath: 'id' });
          documents.createIndex('by_carId', 'carId');
          documents.createIndex('by_kind', 'kind');
          documents.createIndex('by_endDate', 'endDate');
        }
        if (oldVersion < 5) {
          // Backfill `isElectric: false` on existing cars and rewrite legacy fuel
          // expenses ({liters, pricePerLiter}) to the unit-aware shape
          // ({unit:'L', quantity, unitPrice}).
          const carStore = tx.objectStore('cars');
          carStore.openCursor().then(async function walkCars(cursor): Promise<void> {
            if (!cursor) return;
            const car = cursor.value as Record<string, unknown>;
            if (typeof car.isElectric !== 'boolean') {
              await cursor.update({ ...car, isElectric: false });
            }
            const next = await cursor.continue();
            return walkCars(next);
          });

          const expStore = tx.objectStore('expenses');
          expStore.openCursor().then(async function walkExpenses(cursor): Promise<void> {
            if (!cursor) return;
            const e = cursor.value as Record<string, unknown>;
            if (e.category === 'fuel' && (e.liters !== undefined || e.pricePerLiter !== undefined)) {
              const { liters, pricePerLiter, ...rest } = e as {
                liters?: number;
                pricePerLiter?: number;
                [k: string]: unknown;
              };
              await cursor.update({
                ...rest,
                unit: 'L',
                quantity: typeof liters === 'number' ? liters : 0,
                unitPrice: typeof pricePerLiter === 'number' ? pricePerLiter : 0,
              });
            }
            const next = await cursor.continue();
            return walkExpenses(next);
          });
        }
      },
      blocked() {
        console.warn('[cartrack] another tab is holding an older DB version');
      },
      blocking() {
        console.warn('[cartrack] this tab is holding an older DB version');
      },
    });
  }
  return dbPromise;
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (!('storage' in navigator) || !navigator.storage.persist) return false;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
