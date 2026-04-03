import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/atoms/Text";
import { Button } from "heroui-native";
import { ProgressRing } from "@/components/atoms/ProgressRing";
import { DomainBar } from "@/components/atoms/DomainBar";
import { useOnboarding } from "./_layout";
import { AIDownloadStatus } from "@/components/molecules/AIDownloadStatus";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";

const DOMAIN_META = [
  { label: "Money", icon: "💰" },
  { label: "Time", icon: "⏰" },
  { label: "Health", icon: "💪" },
  { label: "People", icon: "👥" },
  { label: "Mind", icon: "🧠" },
];

function useFadeIn(delay: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) })
    );
  }, [delay, opacity, translateY]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

export default function OnboardingStepScore() {
  const router = useRouter();
  const { sliderValues } = useOnboarding();

  const averageScore = Math.round(
    sliderValues.reduce((sum, v) => sum + v, 0) / sliderValues.length
  );

  // Animated ring fill
  const [displayProgress, setDisplayProgress] = useState(0);
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    const targetProgress = averageScore / 100;
    animatedProgress.value = withDelay(
      600,
      withTiming(targetProgress, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      })
    );

    const start = Date.now();
    const delay = 600;
    const duration = 1500;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start - delay;
      if (elapsed < 0) return;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      runOnJS(setDisplayProgress)(eased * targetProgress);
      if (t >= 1) clearInterval(interval);
    }, 16);

    return () => clearInterval(interval);
  }, [averageScore, animatedProgress]);

  const displayScore = Math.round(displayProgress * 100);

  const ringStyle = useFadeIn(300);
  const domainsStyle = useFadeIn(1200);
  const textStyle = useFadeIn(1800);
  const buttonStyle = useFadeIn(2200);

  return (
    <View className="flex-1 bg-background px-6 justify-between">
      {/* Scrollable content */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="items-center pt-24 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Label */}
        <Animated.View style={ringStyle} className="mb-4">
          <AppText size="sm" weight="semibold" color="muted" align="center">
            Your starting clawdi Score
          </AppText>
        </Animated.View>

        {/* Score ring */}
        <Animated.View style={ringStyle} className="items-center mb-8">
          <ProgressRing progress={displayProgress} size={180} strokeWidth={12}>
            <View className="items-center">
              <AppText size="5xl" weight="bold" family="mono" color="primary">
                {displayScore}
              </AppText>
              <AppText size="xs" color="muted">
                out of 100
              </AppText>
            </View>
          </ProgressRing>
        </Animated.View>

        {/* Domain breakdown */}
        <Animated.View style={domainsStyle} className="w-full mb-8">
          <View className="bg-surface rounded-2xl p-5 gap-3">
            <AppText size="xs" color="muted" weight="semibold">
              Your domains
            </AppText>
            {DOMAIN_META.map((domain, i) => (
              <DomainBar
                key={domain.label}
                label={domain.label}
                icon={domain.icon}
                progress={sliderValues[i] / 100}
              />
            ))}
          </View>
        </Animated.View>

        {/* Motivational text */}
        <Animated.View style={textStyle}>
          <AppText
            align="center"
            color="muted"
            family="headline"
            className="px-4"
          >
            It&apos;s not about where you start.{"\n"}
            It&apos;s about where you go from here.
          </AppText>
        </Animated.View>
      </ScrollView>

      {/* Bottom section — pinned */}
      <Animated.View style={buttonStyle} className="w-full pb-12 gap-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-2xl"
          onPress={() => router.replace("/(main)/(tabs)/home")}
        >
          <Button.Label>Enter Your Dashboard</Button.Label>
        </Button>
        <AIDownloadStatus />
      </Animated.View>
    </View>
  );
}
