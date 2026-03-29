import { View } from "react-native";
import { Stack } from "expo-router";

import { MeshGradientBackground } from "@/components/atoms/MeshGradient";
import { AppText } from "@/components/atoms/Text";

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Home",
        }}
      />
      <View className="flex-1 items-center justify-center bg-background px-6">
        <MeshGradientBackground
          colors={{
            primary: "#2563eb",
            secondary: "#14b8a6",
            accent: "#60a5fa",
          }}
        />
        <View className="z-10 max-w-sm gap-4 rounded-3xl bg-surface/85 p-6">
          <AppText size="3xl" weight="bold">
            Fullstack Boilerplate
          </AppText>
          <AppText color="muted">
            Start building from a clean Expo Router shell with shared monorepo
            tooling, reusable CI, and room for your own product structure.
          </AppText>
        </View>
      </View>
    </>
  );
}
