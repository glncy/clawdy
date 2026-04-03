import React, { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/atoms/Text";
import { PhosphorIcon } from "@/components/atoms/PhosphorIcon";
import {
  CurrencyDollar,
  Clock,
  Heartbeat,
  UsersThree,
  Brain,
  Target,
  CheckCircle,
} from "phosphor-react-native";
import { Button } from "heroui-native";
import { useOnboarding } from "./_layout";
import { AIDownloadStatus } from "@/components/molecules/AIDownloadStatus";
import { useCSSVariable } from "uniwind";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import type { ComponentType } from "react";
import type { IconProps } from "phosphor-react-native";

const DOMAIN_META: {
  label: string;
  icon: ComponentType<IconProps>;
  description: string;
}[] = [
  { label: "Finances", icon: CurrencyDollar, description: "Take control of your money" },
  { label: "Time", icon: Clock, description: "Spend your time intentionally" },
  { label: "Health", icon: Heartbeat, description: "Take care of your body" },
  { label: "Relationships", icon: UsersThree, description: "Stay close to people you love" },
  { label: "Growth", icon: Brain, description: "Keep learning and growing" },
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

export default function OnboardingStepFocus() {
  const router = useRouter();
  const { sliderValues } = useOnboarding();
  const [primaryColor, mutedColor] = useCSSVariable([
    "--color-primary",
    "--color-muted",
  ]);

  // Domains below 50 are focus areas
  const focusAreas = DOMAIN_META.filter((_, i) => sliderValues[i] < 50);
  const strongAreas = DOMAIN_META.filter((_, i) => sliderValues[i] >= 50);

  const headerStyle = useFadeIn(200);
  const focusStyle = useFadeIn(600);
  const strongStyle = useFadeIn(1000);
  const textStyle = useFadeIn(1400);
  const buttonStyle = useFadeIn(1800);

  return (
    <View className="flex-1 bg-background px-6 justify-between">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-20 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={headerStyle} className="items-center mb-4">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
            <PhosphorIcon
              icon={Target}
              weight="duotone"
              size={32}
              color={primaryColor as string}
            />
          </View>
          <AppText
            size="2xl"
            weight="bold"
            family="headline"
            align="center"
            className="mb-2"
          >
            {focusAreas.length > 0
              ? "Here\u2019s what we\u2019ll focus on"
              : "You\u2019re in great shape"}
          </AppText>
          <AppText align="center" color="muted" className="px-4">
            {focusAreas.length > 0
              ? "Based on what you told us, these areas need the most attention."
              : "All your domains look healthy. Let\u2019s keep it that way."}
          </AppText>
        </Animated.View>

        {/* Focus areas */}
        {focusAreas.length > 0 && (
          <Animated.View style={focusStyle} className="mt-6 gap-3">
            <AppText size="xs" color="muted" weight="semibold" className="px-1">
              Focus areas
            </AppText>
            {focusAreas.map((domain) => (
              <View
                key={domain.label}
                className="flex-row items-center gap-4 bg-primary/10 rounded-2xl px-5 py-4"
              >
                <PhosphorIcon
                  icon={domain.icon}
                  weight="duotone"
                  size={28}
                  color={primaryColor as string}
                />
                <View className="flex-1">
                  <AppText weight="semibold">{domain.label}</AppText>
                  <AppText size="xs" color="muted">
                    {domain.description}
                  </AppText>
                </View>
                <PhosphorIcon
                  icon={Target}
                  weight="bold"
                  size={18}
                  color={primaryColor as string}
                />
              </View>
            ))}
          </Animated.View>
        )}

        {/* Strong areas */}
        {strongAreas.length > 0 && (
          <Animated.View style={strongStyle} className="mt-6 gap-3">
            <AppText size="xs" color="muted" weight="semibold" className="px-1">
              {focusAreas.length > 0 ? "Looking good" : "Your strengths"}
            </AppText>
            {strongAreas.map((domain) => (
              <View
                key={domain.label}
                className="flex-row items-center gap-4 bg-surface rounded-2xl px-5 py-4"
              >
                <PhosphorIcon
                  icon={domain.icon}
                  weight="regular"
                  size={24}
                  color={mutedColor as string}
                />
                <View className="flex-1">
                  <AppText color="muted">{domain.label}</AppText>
                </View>
                <PhosphorIcon
                  icon={CheckCircle}
                  weight="fill"
                  size={18}
                  color={primaryColor as string}
                />
              </View>
            ))}
          </Animated.View>
        )}

        {/* Motivational text */}
        <Animated.View style={textStyle} className="mt-8">
          <AppText
            align="center"
            color="muted"
            family="headline"
            className="px-4"
          >
            clawdi will help you build better habits{"\n"}
            one day at a time.
          </AppText>
        </Animated.View>
      </ScrollView>

      {/* Bottom section — pinned */}
      <Animated.View style={buttonStyle} className="w-full pb-12 gap-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-2xl"
          onPress={() => router.push("/(main)/onboarding/step-name")}
        >
          <Button.Label>Continue</Button.Label>
        </Button>
        <AIDownloadStatus />
      </Animated.View>
    </View>
  );
}
