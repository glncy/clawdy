import { Pressable } from "react-native";
import { Plus } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";
import { useQuickActionStore } from "@/stores/useQuickActionStore";

/**
 * Floating "+" action button for iOS <26 and Android.
 * Positioned bottom-right above the pill tab bar — does not overlap tabs.
 * @level Organism
 */
export function AppTabBarFAB() {
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
        bottom: insets.bottom + 84,
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
