import { forwardRef } from "react";
import { Pressable, View } from "react-native";
import type { PressableProps } from "react-native";
import type { ComponentType } from "react";
import type { IconProps } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";
import { AppText } from "@/components/atoms/Text";

interface AppTabItemProps extends PressableProps {
  label: string;
  icon: ComponentType<IconProps>;
  isFocused?: boolean;
}

/**
 * Individual tab item — icon + label, focus-aware.
 * Uses forwardRef so TabTrigger asChild can forward isFocused + onPress.
 * @level Molecule
 */
export const AppTabItem = forwardRef<View, AppTabItemProps>(
  ({ label, icon: Icon, isFocused = false, ...props }, ref) => {
    const [primaryColor, mutedColor] = useCSSVariable([
      "--color-primary",
      "--color-muted",
    ]);

    return (
      <Pressable
        ref={ref}
        {...props}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={label}
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
          {label}
        </AppText>
      </Pressable>
    );
  }
);

AppTabItem.displayName = "AppTabItem";
