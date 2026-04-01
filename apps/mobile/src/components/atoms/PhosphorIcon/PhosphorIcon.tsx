import type { IconProps, IconWeight } from "phosphor-react-native";
import type { ComponentType } from "react";
import { useCSSVariable } from "uniwind";

interface PhosphorIconProps {
  icon: ComponentType<IconProps>;
  size?: number;
  weight?: IconWeight;
  color?: string;
  className?: string;
}

/**
 * Phosphor Icon Wrapper
 * @level Atom
 */
export const PhosphorIcon = ({
  icon: Icon,
  size = 24,
  weight = "regular",
  color,
  ...props
}: PhosphorIconProps) => {
  const [foregroundColor] = useCSSVariable(["--color-foreground"]);
  const resolvedColor = color ?? (foregroundColor as string);

  return <Icon size={size} weight={weight} color={resolvedColor} {...props} />;
};
