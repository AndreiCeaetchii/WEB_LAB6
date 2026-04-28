import { create } from 'zustand';
import type { DocumentKind } from '../lib/types';

type QuickModal =
  | { type: 'none' }
  | { type: 'car' }
  | { type: 'expense' }
  | { type: 'document'; kind: DocumentKind };

interface UIState {
  quick: QuickModal;
  openCar: () => void;
  openExpense: () => void;
  openDocument: (kind: DocumentKind) => void;
  close: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  quick: { type: 'none' },
  openCar: () => set({ quick: { type: 'car' } }),
  openExpense: () => set({ quick: { type: 'expense' } }),
  openDocument: (kind) => set({ quick: { type: 'document', kind } }),
  close: () => set({ quick: { type: 'none' } }),
}));
