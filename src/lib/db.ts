import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type { Car, Expense } from './types';

export const DB_NAME = 'cartrack';
export const DB_VERSION = 3;

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
}

let dbPromise: Promise<IDBPDatabase<CarTrackDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<CarTrackDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CarTrackDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
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
