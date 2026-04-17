import { create } from "zustand";

interface LogInteractionSheetState {
  isOpen: boolean;
  prefillContactId: string | null;
  open: (contactId?: string) => void;
  close: () => void;
}

export const useLogInteractionSheetStore = create<LogInteractionSheetState>(
  (set) => ({
    isOpen: false,
    prefillContactId: null,
    open: (contactId) =>
      set({ isOpen: true, prefillContactId: contactId ?? null }),
    close: () => set({ isOpen: false, prefillContactId: null }),
  }),
);
