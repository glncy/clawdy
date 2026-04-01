import { create } from "zustand";

export type AIStatus =
  | "idle"
  | "downloading"
  | "loading"
  | "ready"
  | "inferring"
  | "error";

interface AIState {
  status: AIStatus;
  downloadProgress: number;
  downloadedBytes: number;
  totalBytes: number;
  error: string | null;
  isModelDownloaded: boolean;
  response: string;
  tokensPerSecond: number | null;

  setStatus: (status: AIStatus) => void;
  setDownloadProgress: (progress: number, downloaded: number, total: number) => void;
  setError: (error: string | null) => void;
  setModelDownloaded: (downloaded: boolean) => void;
  setResponse: (response: string) => void;
  appendResponse: (token: string) => void;
  clearResponse: () => void;
  setTokensPerSecond: (tps: number | null) => void;
  reset: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  status: "idle",
  downloadProgress: 0,
  downloadedBytes: 0,
  totalBytes: 0,
  error: null,
  isModelDownloaded: false,
  response: "",
  tokensPerSecond: null,

  setStatus: (status) => set({ status, error: status === "error" ? undefined : null }),
  setDownloadProgress: (progress, downloaded, total) =>
    set({ downloadProgress: progress, downloadedBytes: downloaded, totalBytes: total }),
  setError: (error) => set({ error, status: error ? "error" : "idle" }),
  setModelDownloaded: (downloaded) => set({ isModelDownloaded: downloaded }),
  setResponse: (response) => set({ response }),
  appendResponse: (token) => set((state) => ({ response: state.response + token })),
  clearResponse: () => set({ response: "", tokensPerSecond: null }),
  setTokensPerSecond: (tps) => set({ tokensPerSecond: tps }),
  reset: () =>
    set({
      status: "idle",
      downloadProgress: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      error: null,
      response: "",
      tokensPerSecond: null,
    }),
}));
