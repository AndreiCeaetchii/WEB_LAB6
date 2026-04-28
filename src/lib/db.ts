import { openDB, type IDBPDatabase, type DBSchema } from 'idb';

export const DB_NAME = 'cartrack';
export const DB_VERSION = 1;

export interface CarTrackDB extends DBSchema {
  __placeholder: {
    key: string;
    value: { id: string };
  };
}

let dbPromise: Promise<IDBPDatabase<CarTrackDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<CarTrackDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CarTrackDB>(DB_NAME, DB_VERSION, {
      upgrade(_db, oldVersion) {
        // schema v1: bootstrap. Entity stores (cars/expenses/documents)
        // are added by later PRs as the version is bumped.
        void oldVersion;
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
