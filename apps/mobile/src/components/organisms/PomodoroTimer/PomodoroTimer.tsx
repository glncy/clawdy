import { View } from "react-native";
import { useEffect } from "react";
import { Button } from "heroui-native";
import { ProgressRing } from "@/components/atoms/ProgressRing";
import { AppText } from "@/components/atoms/Text";
import { useTimerStore } from "@/stores/useTimerStore";

export const PomodoroTimer = () => {
  const { seconds, isRunning, sessionLength, start, pause, reset, tick } =
    useTimerStore();

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = 1 - seconds / sessionLength;

  return (
    <View className="items-center gap-4">
      <AppText size="sm" color="muted" weight="semibold">
        Focus Session
      </AppText>
      <ProgressRing progress={progress} size={160} strokeWidth={8}>
        <AppText size="4xl" weight="bold" family="mono">
          {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </AppText>
      </ProgressRing>
      <View className="flex-row gap-3">
        <Button
          variant={isRunning ? "secondary" : "primary"}
          onPress={isRunning ? pause : start}
        >
          <Button.Label>{isRunning ? "Pause" : "Start"}</Button.Label>
        </Button>
        <Button variant="tertiary" onPress={reset}>
          <Button.Label>Reset</Button.Label>
        </Button>
      </View>
    </View>
  );
};
