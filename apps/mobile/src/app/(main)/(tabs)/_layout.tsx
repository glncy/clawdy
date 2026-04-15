import { Pressable, View } from "react-native";
import { Tabs, Stack } from "expo-router";
import { Plus } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";
import { AppTabBar } from "@/components/organisms/CustomTabBar";
import { QuickActionSheet } from "@/components/organisms/QuickActionSheet";
import { SettingsSheet } from "@/components/organisms/SettingsSheet";
import { useSystemTheme } from "@/hooks/useCustomTheme";
import { useQuickActionStore } from "@/stores/useQuickActionStore";

/**
 * Floating "+" FAB for iOS <26 and Android.
 * Positioned bottom-right above the pill tab bar — does not overlap tabs.
 */
function AppTabBarFAB() {
  const insets = useSafeAreaInsets();
  const [primaryColor, primaryForegroundColor] = useCSSVariable([
    "--color-primary",
    "--color-primary-foreground",
  ]);

  return (
    <Pressable
      onPress={() => useQuickActionStore.getState().open()}
      accessibilityLabel="Quick actions"
      accessibilityRole="button"
      className="absolute right-5 h-[52px] w-[52px] items-center justify-center rounded-full shadow-lg"
      style={{
        bottom: insets.bottom + 76,
        backgroundColor: primaryColor as string,
        shadowColor: primaryColor as string,
        shadowOpacity: 0.35,
        elevation: 6,
        // @ts-ignore - borderCurve is iOS-only
        borderCurve: "continuous",
      }}
    >
      <Plus size={24} weight="bold" color={primaryForegroundColor as string} />
    </Pressable>
  );
}

export default function TabLayout() {
  useSystemTheme();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-background">
        <Tabs
          tabBar={(props) => <AppTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="home" />
          <Tabs.Screen name="money" />
          <Tabs.Screen name="day" />
          <Tabs.Screen name="life" />
          {/* People and Settings are accessible via gear icon, hidden from tab bar */}
          <Tabs.Screen name="people" options={{ href: null }} />
          <Tabs.Screen name="settings" options={{ href: null }} />
          <Tabs.Screen name="more" options={{ href: null }} />
        </Tabs>
        <AppTabBarFAB />
        <QuickActionSheet />
        <SettingsSheet />
      </View>
    </>
  );
}
