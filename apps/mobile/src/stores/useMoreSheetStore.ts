import { create } from "zustand";

interface MoreSheetState {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const useMoreSheetStore = create<MoreSheetState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}));
