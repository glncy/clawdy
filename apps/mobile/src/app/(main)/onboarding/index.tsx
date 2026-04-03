import React, { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/atoms/Text";
import { Button } from "heroui-native";
import { PhosphorIcon } from "@/components/atoms/PhosphorIcon";
import { Brain, CheckCircle } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";
import { useLocalAI } from "@/hooks/useLocalAI";
import { useOnboarding, DOWNLOAD_BAR_PADDING } from "./_layout";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";

const DOMAINS = [
  { emoji: "💰", label: "Money" },
  { emoji: "⏰", label: "Time" },
  { emoji: "💪", label: "Health" },
  { emoji: "👥", label: "People" },
  { emoji: "🧠", label: "Mind" },
];

function useFadeInUp(delay: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) })
    );
  }, [delay, opacity, translateY]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

export default function OnboardingIndex() {
  const router = useRouter();
  const { isDownloadBarVisible } = useOnboarding();
  const { isModelDownloaded } = useLocalAI();
  const [primaryColor] = useCSSVariable(["--color-primary"]);

  const style0 = useFadeInUp(0);
  const style1 = useFadeInUp(200);
  const style2 = useFadeInUp(400);
  const style3 = useFadeInUp(600);

  return (
    <View
      className="flex-1 bg-background px-6 justify-between"
      style={isDownloadBarVisible ? { paddingBottom: DOWNLOAD_BAR_PADDING } : undefined}
    >
      <View className="flex-1 justify-center items-center">
        {/* Icon */}
        <Animated.View style={style0} className="mb-8">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center">
            {isModelDownloaded ? (
              <PhosphorIcon
                icon={CheckCircle}
                weight="fill"
                size={36}
                color={primaryColor as string}
              />
            ) : (
              <PhosphorIcon
                icon={Brain}
                weight="duotone"
                size={36}
                color={primaryColor as string}
              />
            )}
          </View>
        </Animated.View>

        {/* Headline */}
        <Animated.View style={style1} className="items-center mb-6">
          <AppText
            size="3xl"
            weight="bold"
            family="headline"
            align="center"
          >
            Be honest with yourself{"\n"}for 60 seconds
          </AppText>
        </Animated.View>

        {/* Subtext */}
        <Animated.View style={style1} className="items-center mb-10">
          <AppText align="center" color="muted" size="lg">
            Finance is your foundation. Life is your goal.{"\n"}
            We need to know where you stand today.
          </AppText>
        </Animated.View>

        {/* Domain preview chips */}
        <Animated.View style={style2} className="flex-row gap-3 flex-wrap justify-center">
          {DOMAINS.map((d) => (
            <View
              key={d.label}
              className="flex-row items-center gap-1.5 bg-surface rounded-full px-4 py-2"
            >
              <AppText size="sm">{d.emoji}</AppText>
              <AppText size="xs" weight="medium" color="muted">
                {d.label}
              </AppText>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Bottom section */}
      <Animated.View style={style3} className="items-center w-full pb-10">
        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-2xl"
          onPress={() => router.push("/(main)/onboarding/step-sliders")}
        >
          <Button.Label>Start the Mirror</Button.Label>
        </Button>
      </Animated.View>
    </View>
  );
}
