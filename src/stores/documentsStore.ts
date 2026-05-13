import { create } from 'zustand';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { isExpiringWithin } from '../lib/validity';
import { useCarsStore } from './carsStore';
import type { DocumentInput, DocumentKind, ID, VehicleDocument } from '../lib/types';

interface ApiDocumentDto {
  id: string;
  carId: string;
  kind: string;
  insurer: string;
  policyNumber: string;
  startDate: string;
  endDate: string;
  cost: number;
  note?: string | null;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResult<T> { items: T[]; total: number; page: number; pageSize: number; }

function mapDocument(dto: ApiDocumentDto): VehicleDocument {
  return {
    id: dto.id,
    carId: dto.carId,
    kind: dto.kind as DocumentKind,
    insurer: dto.insurer,
    policyNumber: dto.policyNumber,
    startDate: dto.startDate,
    endDate: dto.endDate,
    cost: dto.cost,
    note: dto.note ?? undefined,
    photoUrls: dto.photoUrls,
    createdAt: new Date(dto.createdAt).getTime(),
    updatedAt: new Date(dto.updatedAt).getTime(),
  };
}

function extractPictureId(photoUrl: string): string {
  const path = new URL(photoUrl).pathname;
  const filename = path.split('/').pop()!;
  return filename.replace('.webp', '');
}

interface DocumentsState {
  documents: VehicleDocument[];
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  add: (input: DocumentInput) => Promise<VehicleDocument>;
  update: (id: ID, patch: Partial<DocumentInput>) => Promise<VehicleDocument | undefined>;
  remove: (id: ID) => Promise<void>;
  removeForCar: (carId: ID) => Promise<number>;
  removePhoto: (carId: ID, docId: ID, photoUrl: string) => Promise<void>;
  setDocument: (doc: VehicleDocument) => void;
  byKind: (kind: DocumentKind) => VehicleDocument[];
  byCar: (carId: ID, kind?: DocumentKind) => VehicleDocument[];
  expiringWithin: (days: number) => VehicleDocument[];
  invalidate: () => void;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
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
            .get<PaginatedResult<ApiDocumentDto>>(`/cars/${car.id}/documents?pageSize=1000`)
            .then((r) => r.data.items.map(mapDocument)),
        ),
      );
      const documents = results.flat();
      documents.sort((a, b) => (a.endDate < b.endDate ? -1 : a.endDate > b.endDate ? 1 : 0));
      set({ documents, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  add: async (input) => {
    const { data } = await api.post<ApiDocumentDto>(`/cars/${input.carId}/documents`, {
      kind: input.kind,
      insurer: input.insurer,
      policyNumber: input.policyNumber,
      startDate: input.startDate,
      endDate: input.endDate,
      cost: input.cost,
      note: input.note,
    });
    const doc = mapDocument(data);
    set({ documents: [doc, ...get().documents] });
    toast.success(input.kind === 'rca' ? 'Insurance added' : 'Cartea Verde added');
    return doc;
  },

  update: async (id, patch) => {
    const existing = get().documents.find((d) => d.id === id);
    if (!existing) { toast.error('Document not found'); return undefined; }
    const { data } = await api.put<ApiDocumentDto>(`/cars/${existing.carId}/documents/${id}`, {
      kind: patch.kind ?? existing.kind,
      insurer: patch.insurer ?? existing.insurer,
      policyNumber: patch.policyNumber ?? existing.policyNumber,
      startDate: patch.startDate ?? existing.startDate,
      endDate: patch.endDate ?? existing.endDate,
      cost: patch.cost ?? existing.cost,
      note: patch.note ?? existing.note,
    });
    const updated = mapDocument(data);
    set({ documents: get().documents.map((d) => (d.id === id ? updated : d)) });
    toast.success('Saved');
    return updated;
  },

  remove: async (id) => {
    const existing = get().documents.find((d) => d.id === id);
    if (!existing) return;
    await api.delete(`/cars/${existing.carId}/documents/${id}`);
    set({ documents: get().documents.filter((d) => d.id !== id) });
    toast.success('Document removed');
  },

  removeForCar: async (carId) => {
    const count = get().documents.filter((d) => d.carId === carId).length;
    set({ documents: get().documents.filter((d) => d.carId !== carId) });
    return count;
  },

  removePhoto: async (carId, docId, photoUrl) => {
    const pictureId = extractPictureId(photoUrl);
    await api.delete(`/cars/${carId}/documents/${docId}/photos/${pictureId}`);
    set({
      documents: get().documents.map((d) =>
        d.id === docId ? { ...d, photoUrls: d.photoUrls.filter((u) => u !== photoUrl) } : d,
      ),
    });
  },

  setDocument: (doc) => {
    set({
      documents: get().documents.some((d) => d.id === doc.id)
        ? get().documents.map((d) => (d.id === doc.id ? doc : d))
        : [...get().documents, doc],
    });
  },

  byKind: (kind) => get().documents.filter((d) => d.kind === kind),
  byCar: (carId, kind) =>
    get().documents.filter(
      (d) => d.carId === carId && (kind === undefined || d.kind === kind),
    ),
  expiringWithin: (days) => get().documents.filter((d) => isExpiringWithin(d, days)),
  invalidate: () => set({ loaded: false }),
}));
