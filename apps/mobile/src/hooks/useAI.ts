/**
 * Unified AI hook — routes inference to the correct provider:
 *   - "apple"  → Apple Foundation Models (iOS 26+, Apple Intelligence)
 *   - "gemma"  → Gemma 4 E2B via llama.cpp (6+ GB RAM devices)
 *   - "gemini" → Gemini 3 Flash cloud API (fallback / user preference)
 *
 * All providers expose the same interface so callers are provider-agnostic.
 * Currently always resolves to "gemma" until other providers are wired up.
 */

import { useAIProvider } from "./useAIProvider";
import { useLocalAI } from "./useLocalAI";

export type { AIProvider } from "./useAIProvider";

export function useAI() {
  const { provider, isChecking: isCheckingProvider } = useAIProvider();
  const gemma = useLocalAI();

  // Apple Foundation Models branch — add implementation here once
  // @react-native-ai/apple is installed. For now provider always
  // resolves to "gemma" because the package is absent.
  if (provider === "apple") {
    // TODO: return apple implementation when package is installed
    // For now fall through to gemma as safe default
  }

  return {
    ...gemma,
    provider,
    isCheckingProvider,
  };
}
