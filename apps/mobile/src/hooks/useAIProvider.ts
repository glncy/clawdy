// apps/mobile/src/hooks/useAIProvider.ts
import { Platform } from "react-native";
import { useEffect, useState } from "react";
import {
  useAIPreferenceStore,
} from "@/stores/useAIPreferenceStore";

export type AIProvider = "apple" | "gemma" | "gemini";

/**
 * Resolves the active AI provider:
 *   "apple"  — Apple Foundation Models (iOS 26+, Apple Intelligence enabled)
 *   "gemma"  — Gemma 4 E2B via llama.cpp (local, cross-platform)
 *   "gemini" — Gemini 3 Flash cloud API (requires API key)
 *
 * Fallback rules:
 *   - preferred "apple" but unavailable → "gemma"
 *   - preferred "gemini" but no API key → "gemma"
 */
export function useAIProvider(): { provider: AIProvider; isChecking: boolean } {
  const preferredProvider = useAIPreferenceStore((s) => s.preferredProvider);
  const geminiApiKey = useAIPreferenceStore((s) => s.geminiApiKey);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (Platform.OS !== "ios") {
      setIsChecking(false);
      return;
    }
    // Dynamic import keeps Android from loading the iOS-only TurboModule
    import("@react-native-ai/apple")
      .then(({ apple }) => {
        const available = apple.isAvailable();
        setIsAppleAvailable(available);
        console.debug("[useAIProvider] resolved:", {
          preferredProvider,
          isAppleAvailable: available,
          hasGeminiKey: !!geminiApiKey,
          provider:
            preferredProvider === "apple" && available
              ? "apple"
              : preferredProvider === "gemini" && !!geminiApiKey
              ? "gemini"
              : "gemma",
        });
      })
      .catch(() => {
        setIsAppleAvailable(false);
      })
      .finally(() => setIsChecking(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // intentionally run once on mount — provider preference changes are handled
  // by re-rendering the computed `provider` value below

  let provider: AIProvider = "gemma";
  if (!isChecking) {
    if (preferredProvider === "apple" && isAppleAvailable) {
      provider = "apple";
    } else if (preferredProvider === "gemini" && !!geminiApiKey) {
      provider = "gemini";
    }
  }

  return { provider, isChecking };
}
