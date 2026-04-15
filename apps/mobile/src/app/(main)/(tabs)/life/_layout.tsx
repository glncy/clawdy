import { Platform } from "react-native";
import { Stack } from "expo-router";
import { useTabHeaderTitleStyle } from "@/hooks/useTabHeaderTitleStyle";
import { HeaderGearButton } from "@/components/molecules/HeaderGearButton";

const isLiquidGlass =
  Platform.OS === "ios" && parseInt(Platform.Version as string, 10) >= 26;

export default function LifeStack() {
  const headerTitleStyle = useTabHeaderTitleStyle();

  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerBlurEffect: isLiquidGlass ? undefined : "systemMaterial",
        headerTitleStyle,
        headerRight: () => <HeaderGearButton tab="life" />,
      }}
    />
  );
}
