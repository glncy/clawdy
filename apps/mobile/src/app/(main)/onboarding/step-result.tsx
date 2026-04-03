import React, { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/atoms/Text";
import { Button } from "heroui-native";
import { PhosphorIcon } from "@/components/atoms/PhosphorIcon";
import { Warning } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";
import { AIDownloadStatus } from "@/components/molecules/AIDownloadStatus";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";

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

function useFadeInScale(delay: number) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) })
    );
    scale.value = withDelay(
      delay,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.back(2)) })
    );
  }, [delay, opacity, scale]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
}

export default function OnboardingStepResult() {
  const router = useRouter();
  const [dangerColor] = useCSSVariable(["--color-danger"]);

  // Pulsing icon
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.8);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    iconOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) })
    );
    iconScale.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.back(2)) })
    );
    // Start pulsing after initial animation
    pulseScale.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [iconOpacity, iconScale, pulseScale]);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value * pulseScale.value }],
  }));

  const line1Style = useFadeIn(700);
  const line2Style = useFadeIn(1000);
  const subtextStyle = useFadeIn(1400);
  const untilStyle = useFadeInScale(1900);
  const buttonStyle = useFadeIn(2400);

  return (
    <View className="flex-1 bg-background px-6 justify-between">
      <View className="flex-1 justify-center items-center">
        {/* Warning icon — pulsing */}
        <Animated.View
          style={iconStyle}
          className="w-24 h-24 rounded-full bg-danger/10 items-center justify-center mb-10"
        >
          <PhosphorIcon
            icon={Warning}
            size={48}
            weight="duotone"
            color={dangerColor as string}
          />
        </Animated.View>

        {/* Dramatic text */}
        <Animated.View style={line1Style}>
          <AppText size="3xl" weight="bold" family="headline" align="center">
            You are surviving,
          </AppText>
        </Animated.View>

        <Animated.View style={line2Style} className="mb-6">
          <AppText size="3xl" weight="bold" family="headline" align="center" color="danger">
            not living.
          </AppText>
        </Animated.View>

        <Animated.View style={subtextStyle} className="mb-10 px-4">
          <AppText align="center" color="muted">
            Your finances feel scattered, time is slipping away, and your energy is low.
          </AppText>
        </Animated.View>

        {/* "Until now" — scale up with bounce */}
        <Animated.View style={untilStyle}>
          <AppText size="2xl" weight="bold" family="headline" align="center" color="primary">
            Until now.
          </AppText>
        </Animated.View>
      </View>

      <Animated.View style={buttonStyle} className="w-full pb-12 gap-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-2xl"
          onPress={() => router.push("/(main)/onboarding/step-question/income")}
        >
          <Button.Label>Change Everything</Button.Label>
        </Button>
        <AIDownloadStatus />
      </Animated.View>
    </View>
  );
}
