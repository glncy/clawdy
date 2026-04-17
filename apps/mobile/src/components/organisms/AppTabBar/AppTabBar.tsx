import { View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { House, CurrencyDollar, Sun, Leaf, UsersThree } from "phosphor-react-native";
import type { ComponentType } from "react";
import type { IconProps } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppTabItem } from "./AppTabItem";

const TAB_CONFIG: Record<
  string,
  { label: string; icon: ComponentType<IconProps> }
> = {
  home: { label: "Home", icon: House },
  money: { label: "Finance", icon: CurrencyDollar },
  day: { label: "Day", icon: Sun },
  life: { label: "Life", icon: Leaf },
  people: { label: "People", icon: UsersThree },
};

const ALL_TABS = ["home", "money", "day", "life", "people"];

/**
 * Floating pill-shaped tab bar for iOS <26 and Android.
 * Renders 5 equal tabs: Home, Finance, Day, Life, People.
 * The "+" FAB is rendered separately as AppTabBarFAB.
 * @level Organism
 */
export function AppTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const renderTab = (routeName: string) => {
    const routeIndex = state.routes.findIndex((r) => r.name === routeName);
    if (routeIndex === -1) return null;

    const route = state.routes[routeIndex];
    const config = TAB_CONFIG[routeName];
    if (!config) return null;

    const { options } = descriptors[route.key];
    const isFocused = state.index === routeIndex;

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
      navigation.emit({ type: "tabLongPress", target: route.key });
    };

    return (
      <AppTabItem
        key={route.key}
        label={options.tabBarAccessibilityLabel ?? config.label}
        icon={config.icon}
        isFocused={isFocused}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    );
  };

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="mx-4 mb-1 flex-row overflow-hidden rounded-full bg-surface shadow-xl">
        {ALL_TABS.map(renderTab)}
      </View>
    </View>
  );
}
