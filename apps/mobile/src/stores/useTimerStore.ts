import { create } from "zustand";

interface TimerState {
  seconds: number;
  isRunning: boolean;
  sessionLength: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  seconds: 50 * 60,
  isRunning: false,
  sessionLength: 50 * 60,
  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () => set((state) => ({ seconds: state.sessionLength, isRunning: false })),
  tick: () =>
    set((state) => {
      if (state.seconds <= 0) return { isRunning: false, seconds: 0 };
      return { seconds: state.seconds - 1 };
    }),
}));
