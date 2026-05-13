import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { pickNextAccent } from '../lib/palette';
import { useExpensesStore } from './expensesStore';
import { useDocumentsStore } from './documentsStore';
import type { Car, CarInput, ID } from '../lib/types';

interface CarApiDto {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  accentId: string;
  isElectric: boolean;
  favorite: boolean;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface UploadUrlResponse {
  uploadUrl: string;
  objectKey: string;
  pictureId: string;
}

function mapCar(dto: CarApiDto): Car {
  return {
    id: dto.id,
    make: dto.make,
    model: dto.model,
    year: dto.year,
    vin: dto.vin,
    licensePlate: dto.licensePlate,
    accentId: dto.accentId,
    isElectric: dto.isElectric,
    favorite: dto.favorite,
    photoUrls: dto.photoUrls,
    createdAt: new Date(dto.createdAt).getTime(),
    updatedAt: new Date(dto.updatedAt).getTime(),
  };
}

interface CarsState {
  cars: Car[];
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  add: (input: CarInput, photo?: Blob) => Promise<Car>;
  update: (id: ID, patch: Partial<CarInput>, photo?: Blob) => Promise<void>;
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
      const { data } = await api.get<PaginatedResult<CarApiDto>>('/cars?page=1&pageSize=1000');
      const cars = data.items.map(mapCar);
      cars.sort((a, b) => b.createdAt - a.createdAt);
      set({ cars, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  add: async (input, photo) => {
    const usedAccentIds = get().cars.map((c) => c.accentId);
    const accent = pickNextAccent(usedAccentIds);
    const { data } = await api.post<CarApiDto>('/cars', {
      make: input.make.trim(),
      model: input.model.trim(),
      year: input.year,
      vin: input.vin.trim(),
      licensePlate: input.licensePlate.trim(),
      accentId: accent.id,
      isElectric: input.isElectric ?? false,
      favorite: input.favorite ?? false,
    });
    let car = mapCar(data);
    if (photo) {
      const { data: urlData } = await api.post<UploadUrlResponse>(`/cars/${car.id}/photos/upload-url`);
      await axios.put(urlData.uploadUrl, photo, { headers: { 'Content-Type': 'image/webp' } });
      const { data: patched } = await api.patch<CarApiDto>(`/cars/${car.id}`, { pictureId: urlData.pictureId });
      car = mapCar(patched);
    }
    set({ cars: [car, ...get().cars] });
    toast.success(`Added ${car.make} ${car.model}`);
    return car;
  },

  update: async (id, patch, photo) => {
    const existing = get().cars.find((c) => c.id === id);
    if (!existing) { toast.error('Car not found'); return; }
    const { data } = await api.put<CarApiDto>(`/cars/${id}`, {
      make: (patch.make ?? existing.make).trim(),
      model: (patch.model ?? existing.model).trim(),
      year: patch.year ?? existing.year,
      vin: (patch.vin ?? existing.vin).trim(),
      licensePlate: (patch.licensePlate ?? existing.licensePlate).trim(),
      accentId: existing.accentId,
      isElectric: patch.isElectric ?? existing.isElectric,
      favorite: patch.favorite ?? existing.favorite,
    });
    let car = mapCar(data);
    if (photo) {
      const { data: urlData } = await api.post<UploadUrlResponse>(`/cars/${id}/photos/upload-url`);
      await axios.put(urlData.uploadUrl, photo, { headers: { 'Content-Type': 'image/webp' } });
      const { data: patched } = await api.patch<CarApiDto>(`/cars/${id}`, { pictureId: urlData.pictureId });
      car = mapCar(patched);
    }
    set({ cars: get().cars.map((c) => (c.id === id ? car : c)) });
    toast.success('Saved');
  },

  remove: async (id) => {
    await api.delete(`/cars/${id}`);
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
    const current = get().cars.find((c) => c.id === id);
    if (!current) return;
    const { data } = await api.patch<CarApiDto>(`/cars/${id}`, { favorite: !current.favorite });
    set({ cars: get().cars.map((c) => (c.id === id ? mapCar(data) : c)) });
  },

  getById: (id) => get().cars.find((c) => c.id === id),
}));
