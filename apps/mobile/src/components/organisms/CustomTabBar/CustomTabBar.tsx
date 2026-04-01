import { View, Pressable } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  House,
  CurrencyDollar,
  Leaf,
  Sun,
  UsersThree,
  Plus,
} from "phosphor-react-native";
import type { ComponentType } from "react";
import type { IconProps } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/atoms/Text";
import { useQuickActionStore } from "@/stores/useQuickActionStore";

const TAB_CONFIG: Record<
  string,
  { label: string; icon: ComponentType<IconProps> }
> = {
  home: { label: "Home", icon: House },
  money: { label: "Money", icon: CurrencyDollar },
  life: { label: "Life", icon: Leaf },
  day: { label: "Day", icon: Sun },
  people: { label: "People", icon: UsersThree },
};

/**
 * Custom Tab Bar with floating center add button
 * @level Organism
 */
export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const toggleQuickAction = useQuickActionStore((s) => s.toggle);
  const [primaryColor, mutedColor, , foregroundColor] =
    useCSSVariable([
      "--color-primary",
      "--color-muted",
      "--color-surface",
      "--color-foreground",
    ]);

  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t border-default bg-surface"
      style={{ paddingBottom: insets.bottom }}
    >
      {/* Floating Add Button */}
      <Pressable
        className="absolute -top-7 left-1/2 z-10 h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary shadow-lg"
        onPress={toggleQuickAction}
      >
        <Plus size={24} weight="bold" color={foregroundColor as string} />
      </Pressable>

      {/* Tab Items */}
      <View className="flex-row items-center justify-around px-2 pt-2">
        {state.routes.map((route, index) => {
          const config = TAB_CONFIG[route.name];
          if (!config) return null;

          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
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

          const iconColor = isFocused
            ? (primaryColor as string)
            : (mutedColor as string);

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center gap-1 py-1"
            >
              <Icon
                size={22}
                weight={isFocused ? "fill" : "regular"}
                color={iconColor}
              />
              <AppText
                size="xs"
                color={isFocused ? "primary" : "muted"}
                align="center"
              >
                {config.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
