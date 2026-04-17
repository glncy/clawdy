import { create } from "zustand";

interface QuickActionState {
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  close: () => void;
}

export const useQuickActionStore = create<QuickActionState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}));
