import { documentDirectory, getInfoAsync, makeDirectoryAsync, deleteAsync } from "expo-file-system";

export const MODEL_CONFIG = {
  name: "Qwen 2.5 0.5B Instruct",
  url: "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf",
  fileName: "qwen2.5-0.5b-instruct-q4_k_m.gguf",
  sizeBytes: 491 * 1024 * 1024,
} as const;

const MODELS_DIR = `${documentDirectory}models/`;

export function getModelPath(): string {
  return `${MODELS_DIR}${MODEL_CONFIG.fileName}`;
}

export async function isModelDownloaded(): Promise<boolean> {
  const info = await getInfoAsync(getModelPath());
  return info.exists;
}

export async function ensureModelsDir(): Promise<void> {
  const info = await getInfoAsync(MODELS_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(MODELS_DIR, { intermediates: true });
  }
}

export async function deleteModel(): Promise<void> {
  const path = getModelPath();
  const info = await getInfoAsync(path);
  if (info.exists) {
    await deleteAsync(path);
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
