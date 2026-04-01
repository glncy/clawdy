import { create } from "zustand";

interface QuickActionState {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const useQuickActionStore = create<QuickActionState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}));
