import { useCallback, useRef } from "react";
import * as FileSystem from "expo-file-system";
import {
  initLlama,
  type LlamaContext,
  type TokenData,
  type NativeCompletionResult,
} from "llama.rn";
import {
  MODEL_CONFIG,
  getModelPath,
  isModelDownloaded,
  ensureModelsDir,
} from "@/services/localAI";
import { useAIStore } from "@/stores/useAIStore";

export function useLocalAI() {
  const contextRef = useRef<LlamaContext | null>(null);
  const downloadRef = useRef<FileSystem.DownloadResumable | null>(null);

  const store = useAIStore();

  const checkModel = useCallback(async () => {
    const exists = await isModelDownloaded();
    store.setModelDownloaded(exists);
    return exists;
  }, [store]);

  const downloadModel = useCallback(async () => {
    store.setStatus("downloading");
    store.setDownloadProgress(0, 0, MODEL_CONFIG.sizeBytes);

    try {
      await ensureModelsDir();
      const modelPath = getModelPath();

      const downloadResumable = FileSystem.createDownloadResumable(
        MODEL_CONFIG.url,
        modelPath,
        {},
        (downloadProgress) => {
          const { totalBytesWritten, totalBytesExpectedToWrite } =
            downloadProgress;
          const progress =
            totalBytesExpectedToWrite > 0
              ? totalBytesWritten / totalBytesExpectedToWrite
              : 0;
          store.setDownloadProgress(
            progress,
            totalBytesWritten,
            totalBytesExpectedToWrite
          );
        }
      );

      downloadRef.current = downloadResumable;
      const result = await downloadResumable.downloadAsync();

      if (result?.uri) {
        store.setModelDownloaded(true);
        store.setStatus("idle");
      } else {
        store.setError("Download failed — no file returned.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Download failed.";
      store.setError(msg);
    } finally {
      downloadRef.current = null;
    }
  }, [store]);

  const loadModel = useCallback(async () => {
    store.setStatus("loading");
    store.setError(null);

    try {
      const modelPath = getModelPath();
      const exists = await isModelDownloaded();

      if (!exists) {
        store.setError("Model not downloaded yet.");
        return;
      }

      const context = await initLlama(
        {
          model: modelPath,
          n_ctx: 2048,
          n_gpu_layers: 0,
        },
        (progress) => {
          // Model loading progress (0-1)
          store.setDownloadProgress(progress, 0, 0);
        }
      );

      contextRef.current = context;
      store.setStatus("ready");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load model.";
      store.setError(msg);
    }
  }, [store]);

  const complete = useCallback(
    async (
      userMessage: string,
      systemPrompt?: string,
      responseFormat?: {
        type: "json_schema";
        json_schema: { schema: object };
      }
    ) => {
      const context = contextRef.current;
      if (!context) {
        store.setError("Model not loaded.");
        return null;
      }

      store.setStatus("inferring");
      store.clearResponse();

      try {
        const result: NativeCompletionResult = await context.completion(
          {
            messages: [
              ...(systemPrompt
                ? [{ role: "system", content: systemPrompt }]
                : []),
              { role: "user", content: userMessage },
            ],
            n_predict: 512,
            temperature: 0.3,
            top_p: 0.9,
            response_format: responseFormat,
          },
          (data: TokenData) => {
            if (data.token) {
              store.appendResponse(data.token);
            }
          }
        );

        // Calculate tokens per second from timings
        if (result.timings?.predicted_per_second) {
          store.setTokensPerSecond(result.timings.predicted_per_second);
        }

        store.setStatus("ready");
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Inference failed.";
        store.setError(msg);
        return null;
      }
    },
    [store]
  );

  const releaseModel = useCallback(async () => {
    if (contextRef.current) {
      await contextRef.current.release();
      contextRef.current = null;
    }
    store.setStatus("idle");
  }, [store]);

  return {
    ...store,
    checkModel,
    downloadModel,
    loadModel,
    complete,
    releaseModel,
    isContextLoaded: !!contextRef.current,
  };
}
