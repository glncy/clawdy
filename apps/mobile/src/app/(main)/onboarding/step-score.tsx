import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/atoms/Text";
import { Button, Card } from "heroui-native";
import { ProgressRing } from "@/components/atoms/ProgressRing";
import { DomainBar } from "@/components/atoms/DomainBar";
import { useOnboarding, DOWNLOAD_BAR_PADDING } from "./_layout";
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
  const { sliderValues, isDownloadBarVisible } = useOnboarding();

  // Compute average score from slider values (0-100)
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

    // Drive the state via interval since ProgressRing uses SVG (not animated)
    const start = Date.now();
    const delay = 600;
    const duration = 1500;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start - delay;
      if (elapsed < 0) return;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      runOnJS(setDisplayProgress)(eased * targetProgress);
      if (t >= 1) clearInterval(interval);
    }, 16);

    return () => clearInterval(interval);
  }, [averageScore, animatedProgress]);

  const displayScore = Math.round(displayProgress * 100);

  const ringStyle = useFadeIn(300);
  const cardStyle = useFadeIn(1200);
  const textStyle = useFadeIn(1800);
  const buttonStyle = useFadeIn(2200);

  return (
    <View
      className="flex-1 bg-background px-6 py-12 justify-between"
      style={isDownloadBarVisible ? { paddingBottom: DOWNLOAD_BAR_PADDING } : undefined}
    >
      <View className="flex-1 justify-center items-center gap-8">
        {/* Score ring */}
        <Animated.View style={ringStyle} className="items-center">
          <AppText
            size="sm"
            weight="semibold"
            color="muted"
            align="center"
            className="mb-6"
          >
            Your starting clawdi Score
          </AppText>
          <ProgressRing progress={displayProgress} size={200} strokeWidth={12}>
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
        <Animated.View style={cardStyle} className="w-full">
          <Card className="bg-surface rounded-2xl">
            <Card.Body className="p-5 gap-3">
              <AppText size="xs" color="muted" weight="semibold">
                Domains
              </AppText>
              {DOMAIN_META.map((domain, i) => (
                <DomainBar
                  key={domain.label}
                  label={domain.label}
                  icon={domain.icon}
                  progress={sliderValues[i] / 100}
                />
              ))}
            </Card.Body>
          </Card>
        </Animated.View>

        {/* Motivational text */}
        <Animated.View style={textStyle}>
          <AppText align="center" color="muted" size="lg">
            It&apos;s not about where you start.{"\n"}
            It&apos;s about where you go from here.
          </AppText>
        </Animated.View>
      </View>

      <Animated.View style={buttonStyle} className="items-center w-full pb-8">
        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-2xl"
          onPress={() => router.replace("/(main)/(tabs)/home")}
        >
          <Button.Label>Enter Your Dashboard</Button.Label>
        </Button>
      </Animated.View>
    </View>
  );
}
