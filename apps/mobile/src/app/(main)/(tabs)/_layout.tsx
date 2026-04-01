import { Tabs, Stack } from "expo-router";
import { View } from "react-native";
import { CustomTabBar } from "@/components/organisms/CustomTabBar";
import { QuickActionSheet } from "@/components/organisms/QuickActionSheet";
import { useSystemTheme } from "@/hooks/useCustomTheme";

export default function TabLayout() {
  useSystemTheme();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1">
        <Tabs
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="home" />
          <Tabs.Screen name="money" />
          <Tabs.Screen name="life" />
          <Tabs.Screen name="day" />
          <Tabs.Screen name="people" />
          <Tabs.Screen name="more" />
        </Tabs>
        <QuickActionSheet />
      </View>
    </>
  );
}
