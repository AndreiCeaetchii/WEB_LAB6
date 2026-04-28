import { create } from 'zustand';
import toast from 'react-hot-toast';
import { getDB } from '../lib/db';
import { isExpiringWithin } from '../lib/validity';
import type {
  DocumentInput,
  DocumentKind,
  ID,
  VehicleDocument,
} from '../lib/types';

const newId = (): ID =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

interface DocumentsState {
  documents: VehicleDocument[];
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  add: (input: DocumentInput) => Promise<VehicleDocument>;
  update: (id: ID, patch: Partial<DocumentInput>) => Promise<void>;
  remove: (id: ID) => Promise<void>;
  removeForCar: (carId: ID) => Promise<number>;
  byKind: (kind: DocumentKind) => VehicleDocument[];
  byCar: (carId: ID, kind?: DocumentKind) => VehicleDocument[];
  expiringWithin: (days: number) => VehicleDocument[];
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  loaded: false,
  loading: false,

  load: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const db = await getDB();
      const documents = await db.getAll('documents');
      // Most-relevant first: expired drift to bottom, soonest end-date at top.
      documents.sort((a, b) => (a.endDate < b.endDate ? -1 : a.endDate > b.endDate ? 1 : 0));
      set({ documents, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  add: async (input) => {
    const db = await getDB();
    const now = Date.now();
    const doc: VehicleDocument = {
      ...input,
      id: newId(),
      cost: Number(input.cost) || 0,
      photos: input.photos ?? [],
      createdAt: now,
      updatedAt: now,
    };
    await db.put('documents', doc);
    set({ documents: [doc, ...get().documents] });
    toast.success(input.kind === 'rca' ? 'Insurance added' : 'Cartea Verde added');
    return doc;
  },

  update: async (id, patch) => {
    const db = await getDB();
    const existing = await db.get('documents', id);
    if (!existing) {
      toast.error('Document not found');
      return;
    }
    const next: VehicleDocument = {
      ...existing,
      ...patch,
      photos: patch.photos !== undefined ? patch.photos : existing.photos,
      updatedAt: Date.now(),
    };
    await db.put('documents', next);
    set({
      documents: get().documents.map((d) => (d.id === id ? next : d)),
    });
    toast.success('Saved');
  },

  remove: async (id) => {
    const db = await getDB();
    await db.delete('documents', id);
    set({ documents: get().documents.filter((d) => d.id !== id) });
    toast.success('Document removed');
  },

  removeForCar: async (carId) => {
    const db = await getDB();
    const tx = db.transaction('documents', 'readwrite');
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
      set({ documents: get().documents.filter((d) => d.carId !== carId) });
    }
    return count;
  },

  byKind: (kind) => get().documents.filter((d) => d.kind === kind),
  byCar: (carId, kind) =>
    get().documents.filter(
      (d) => d.carId === carId && (kind === undefined || d.kind === kind),
    ),
  expiringWithin: (days) =>
    get().documents.filter((d) => isExpiringWithin(d, days)),
}));
