import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useCSSVariable } from "uniwind";
import { Stack } from "expo-router";

import { useSystemTheme } from "@/hooks/useCustomTheme";

export default function TabLayout() {
  useSystemTheme();

  const [primaryColor] = useCSSVariable(["--color-primary"]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <NativeTabs tintColor={primaryColor as string | undefined}>
        <NativeTabs.Trigger name="home">
          <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="about">
          <NativeTabs.Trigger.Icon sf="info.circle.fill" md="info" />
          <NativeTabs.Trigger.Label>About</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </>
  );
}
