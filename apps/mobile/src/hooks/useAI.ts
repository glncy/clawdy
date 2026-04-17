// apps/mobile/src/hooks/useAI.ts
/**
 * Unified AI hook — routes inference to the correct provider:
 *   "apple"  → Apple Foundation Models (iOS 26+, Apple Intelligence)
 *   "gemma"  → Gemma 4 E2B via llama.cpp (6+ GB RAM devices)
 *   "gemini" → Gemini 3 Flash cloud API (requires API key)
 *
 * All providers expose the same interface so callers are provider-agnostic.
 */

import { useAIProvider } from "./useAIProvider";
import { useLocalAI } from "./useLocalAI";
import { useAppleAI } from "./useAppleAI";
import { useGeminiAI } from "./useGeminiAI";

export type { AIProvider } from "./useAIProvider";

export function useAI() {
  const { provider, isChecking: isCheckingProvider } = useAIProvider();
  const gemma = useLocalAI();
  const apple = useAppleAI();
  const gemini = useGeminiAI();

  const impl =
    provider === "apple" ? apple : provider === "gemini" ? gemini : gemma;

  return {
    ...impl,
    provider,
    isCheckingProvider,
  };
}
