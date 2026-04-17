// apps/mobile/src/stores/useAIPreferenceStore.ts
import { Platform } from "react-native";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { zustandStorage } from "@/utils/storage/zustandStorage";

export type AIPreference = "apple" | "gemma" | "gemini";

interface AIPreferenceState {
  preferredProvider: AIPreference;
  geminiApiKey: string | null;
  setPreferredProvider: (p: AIPreference) => void;
  setGeminiApiKey: (key: string | null) => void;
}

export const useAIPreferenceStore = create<AIPreferenceState>()(
  persist(
    (set) => ({
      // Default: apple on iOS (useAIProvider falls back to gemma if unavailable),
      // gemma on Android.
      preferredProvider: Platform.OS === "ios" ? "apple" : "gemma",
      geminiApiKey: null,
      setPreferredProvider: (p) => set({ preferredProvider: p }),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
    }),
    {
      name: "ai-preferences",
      storage: zustandStorage,
    }
  )
);
