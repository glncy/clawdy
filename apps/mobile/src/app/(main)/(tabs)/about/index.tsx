import { View } from "react-native";
import { Stack } from "expo-router";

import { MeshGradientBackground } from "@/components/atoms/MeshGradient";
import { AppText } from "@/components/atoms/Text";

export default function AboutScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "About",
        }}
      />
      <View className="flex-1 items-center justify-center bg-background px-6">
        <MeshGradientBackground
          colors={{
            primary: "#0f172a",
            secondary: "#475569",
            accent: "#94a3b8",
          }}
        />
        <View className="z-10 max-w-sm gap-4 rounded-3xl bg-surface/90 p-6">
          <AppText size="3xl" weight="bold">
            Starter Notes
          </AppText>
          <AppText color="muted">
            Update the app identity, connect your own services, and replace this
            screen with product-specific content when you spin up a new project.
          </AppText>
        </View>
      </View>
    </>
  );
}
