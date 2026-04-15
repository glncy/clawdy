import { View, Pressable } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { House, CurrencyDollar, Sun, Leaf } from "phosphor-react-native";
import type { ComponentType } from "react";
import type { IconProps } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/atoms/Text";

const TAB_CONFIG: Record<
  string,
  { label: string; icon: ComponentType<IconProps> }
> = {
  home: { label: "Home", icon: House },
  money: { label: "Finance", icon: CurrencyDollar },
  day: { label: "Day", icon: Sun },
  life: { label: "Life", icon: Leaf },
};

const ALL_TABS = ["home", "money", "day", "life"];

/**
 * Floating pill-shaped tab bar (iOS <26 and Android).
 * The "+" FAB is rendered separately in _layout.tsx as AppTabBarFAB.
 * @level Organism
 */
export function AppTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [primaryColor, mutedColor] = useCSSVariable([
    "--color-primary",
    "--color-muted",
  ]);

  const renderTab = (routeName: string) => {
    const routeIndex = state.routes.findIndex((r) => r.name === routeName);
    if (routeIndex === -1) return null;

    const route = state.routes[routeIndex];
    const config = TAB_CONFIG[routeName];
    if (!config) return null;

    const { options } = descriptors[route.key];
    const isFocused = state.index === routeIndex;
    const Icon = config.icon;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: "tabLongPress",
        target: route.key,
      });
    };

    return (
      <Pressable
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel ?? config.label}
        onPress={onPress}
        onLongPress={onLongPress}
        className="flex-1 items-center gap-0.5 py-3"
      >
        <Icon
          size={22}
          weight={isFocused ? "fill" : "regular"}
          color={isFocused ? (primaryColor as string) : (mutedColor as string)}
        />
        <AppText
          size="xs"
          color={isFocused ? "primary" : "muted"}
          align="center"
          style={{ fontSize: 9 }}
        >
          {config.label}
        </AppText>
      </Pressable>
    );
  };

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="mx-4 mb-3 flex-row overflow-hidden rounded-full bg-surface shadow-xl">
        {ALL_TABS.map(renderTab)}
      </View>
    </View>
  );
}
