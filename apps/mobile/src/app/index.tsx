import { useSystemTheme } from "@/hooks/useCustomTheme";
import { Redirect } from "expo-router";
import { useUserStore } from "@/stores/useUserStore";

export default function Index() {
  useSystemTheme();
  const hasCompletedOnboarding = useUserStore((s) => s.hasCompletedOnboarding);

  if (hasCompletedOnboarding) {
    return <Redirect href="/(main)/(tabs)/home" />;
  }

  return <Redirect href="/(main)/onboarding" />;
}
