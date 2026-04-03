import React, { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/atoms/Text";
import { Button } from "heroui-native";
import { PhosphorIcon } from "@/components/atoms/PhosphorIcon";
import { Warning } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
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

export default function OnboardingStepResult() {
  const router = useRouter();
  const [dangerColor] = useCSSVariable(["--color-danger"]);

  const iconStyle = useFadeIn(300);
  const line1Style = useFadeIn(700);
  const line2Style = useFadeIn(1000);
  const subtextStyle = useFadeIn(1400);
  const untilStyle = useFadeIn(1900);
  const buttonStyle = useFadeIn(2400);

  return (
    <View className="flex-1 bg-background px-6 py-12 justify-between">
      <View className="flex-1 justify-center items-center">
        {/* Warning icon */}
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

        <Animated.View style={subtextStyle} className="mb-10">
          <AppText size="lg" align="center" color="muted">
            Your finances feel scattered, time is slipping away, and your energy is low.
          </AppText>
        </Animated.View>

        <Animated.View style={untilStyle}>
          <AppText size="2xl" weight="bold" family="headline" align="center" color="primary">
            Until now.
          </AppText>
        </Animated.View>
      </View>

      <Animated.View style={buttonStyle} className="items-center w-full pb-8">
        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-2xl"
          onPress={() => router.push("/(main)/onboarding/step-questions")}
        >
          <Button.Label>Change Everything</Button.Label>
        </Button>
      </Animated.View>
    </View>
  );
}
