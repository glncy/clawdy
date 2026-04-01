import { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { Card, Button, TextField, Input, Separator } from "heroui-native";
import * as Device from "expo-device";
import { AppText } from "@/components/atoms/Text";
import { useLocalAI } from "@/hooks/useLocalAI";
import { MODEL_CONFIG, formatBytes } from "@/services/localAI";
import {
  TRANSACTION_SYSTEM_PROMPT,
  TRANSACTION_SCHEMA,
} from "@/services/transactionSchema";

export default function AITestScreen() {
  const {
    status,
    downloadProgress,
    downloadedBytes,
    totalBytes,
    error,
    isModelDownloaded,
    response,
    tokensPerSecond,
    checkModel,
    downloadModel,
    loadModel,
    complete,
    releaseModel,
    clearResponse,
    isContextLoaded,
  } = useLocalAI();

  const [prompt, setPrompt] = useState("");
  const totalRAM = Device.totalMemory
    ? formatBytes(Device.totalMemory)
    : "Unknown";

  useEffect(() => {
    checkModel();
  }, [checkModel]);

  const handleFreeChat = async () => {
    if (!prompt.trim()) return;
    await complete(prompt.trim());
  };

  const handleTransactionParse = async () => {
    const testInput = "coffee 4.50 at starbucks";
    await complete(testInput, TRANSACTION_SYSTEM_PROMPT, {
      type: "json_schema",
      json_schema: { schema: TRANSACTION_SCHEMA },
    });
  };

  const progressPercent = Math.round(downloadProgress * 100);

  return (
    <>
      <Stack.Screen options={{ title: "Local AI Test" }} />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-5 pt-4 pb-32 gap-4"
      >
        {/* Device Info */}
        <Card className="bg-surface p-4">
          <Card.Body className="gap-2">
            <AppText size="sm" weight="bold" family="headline">
              Device Info
            </AppText>
            <View className="flex-row justify-between">
              <AppText size="xs" color="muted">Total RAM</AppText>
              <AppText size="xs" family="mono">{totalRAM}</AppText>
            </View>
            <View className="flex-row justify-between">
              <AppText size="xs" color="muted">Device</AppText>
              <AppText size="xs" family="mono">
                {Device.modelName ?? "Unknown"}
              </AppText>
            </View>
          </Card.Body>
        </Card>

        {/* Model Info */}
        <Card className="bg-surface p-4">
          <Card.Body className="gap-3">
            <AppText size="sm" weight="bold" family="headline">
              Model
            </AppText>
            <View className="gap-1">
              <View className="flex-row justify-between">
                <AppText size="xs" color="muted">Name</AppText>
                <AppText size="xs" family="mono">{MODEL_CONFIG.name}</AppText>
              </View>
              <View className="flex-row justify-between">
                <AppText size="xs" color="muted">Size</AppText>
                <AppText size="xs" family="mono">
                  {formatBytes(MODEL_CONFIG.sizeBytes)}
                </AppText>
              </View>
              <View className="flex-row justify-between">
                <AppText size="xs" color="muted">Status</AppText>
                <AppText
                  size="xs"
                  weight="semibold"
                  color={isModelDownloaded ? "primary" : "muted"}
                >
                  {isModelDownloaded ? "Downloaded" : "Not downloaded"}
                </AppText>
              </View>
            </View>

            {/* Download Progress */}
            {status === "downloading" && (
              <View className="gap-2">
                <View className="h-3 overflow-hidden rounded-full bg-default">
                  <View
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progressPercent}%` }}
                  />
                </View>
                <AppText size="xs" color="muted" align="center" family="mono">
                  {formatBytes(downloadedBytes)} / {formatBytes(totalBytes)} ({progressPercent}%)
                </AppText>
              </View>
            )}

            {/* Model Loading Progress */}
            {status === "loading" && (
              <View className="items-center gap-2 py-2">
                <ActivityIndicator />
                <AppText size="xs" color="muted">Loading model into memory...</AppText>
              </View>
            )}

            {/* Actions */}
            <View className="flex-row gap-2">
              {!isModelDownloaded && status !== "downloading" && (
                <Button variant="primary" onPress={downloadModel} className="flex-1">
                  <Button.Label>Download</Button.Label>
                </Button>
              )}
              {isModelDownloaded && !isContextLoaded && status !== "loading" && (
                <Button variant="primary" onPress={loadModel} className="flex-1">
                  <Button.Label>Load Model</Button.Label>
                </Button>
              )}
              {isContextLoaded && (
                <Button variant="tertiary" onPress={releaseModel} className="flex-1">
                  <Button.Label>Unload</Button.Label>
                </Button>
              )}
            </View>
          </Card.Body>
        </Card>

        {/* Status */}
        <View className="flex-row items-center gap-2">
          <View
            className={`h-2.5 w-2.5 rounded-full ${
              status === "ready"
                ? "bg-primary"
                : status === "error"
                  ? "bg-danger"
                  : status === "inferring"
                    ? "bg-warning"
                    : "bg-muted"
            }`}
          />
          <AppText size="xs" color="muted">
            Status: {status}
          </AppText>
          {tokensPerSecond !== null && (
            <AppText size="xs" color="primary" family="mono">
              {tokensPerSecond.toFixed(1)} tok/s
            </AppText>
          )}
        </View>

        {error && (
          <AppText size="xs" color="danger">{error}</AppText>
        )}

        <Separator />

        {/* Free Chat */}
        <View className="gap-3">
          <AppText size="sm" weight="bold" family="headline">
            Free Chat
          </AppText>
          <TextField>
            <Input
              placeholder="Type a prompt..."
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={3}
            />
          </TextField>
          <Button
            variant="primary"
            onPress={handleFreeChat}
            isDisabled={!isContextLoaded || status === "inferring" || !prompt.trim()}
          >
            <Button.Label>
              {status === "inferring" ? "Generating..." : "Send"}
            </Button.Label>
          </Button>
        </View>

        <Separator />

        {/* Transaction Parse Test */}
        <View className="gap-3">
          <AppText size="sm" weight="bold" family="headline">
            Transaction Parse Test
          </AppText>
          <AppText size="xs" color="muted">
            Sends &quot;coffee 4.50 at starbucks&quot; with JSON schema constraint
          </AppText>
          <Button
            variant="secondary"
            onPress={handleTransactionParse}
            isDisabled={!isContextLoaded || status === "inferring"}
          >
            <Button.Label>Test Transaction Parse</Button.Label>
          </Button>
        </View>

        <Separator />

        {/* Response */}
        {response.length > 0 && (
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <AppText size="sm" weight="bold" family="headline">
                Response
              </AppText>
              <Button size="sm" variant="tertiary" onPress={clearResponse}>
                <Button.Label>Clear</Button.Label>
              </Button>
            </View>
            <Card className="bg-default p-4">
              <Card.Body>
                <AppText size="sm" family="mono" selectable>
                  {response}
                </AppText>
              </Card.Body>
            </Card>
          </View>
        )}
      </ScrollView>
    </>
  );
}
