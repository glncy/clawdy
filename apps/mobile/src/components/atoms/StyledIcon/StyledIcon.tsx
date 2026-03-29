import { withUniwind } from "uniwind";
import React from "react";
import type { LucideIcon } from "lucide-react-native";

interface IconProps {
  icon: LucideIcon;
  strokeWidth?: number;
  color?: string;
  fill?: string;
  size?: number;
  className?: string; // For Uniwind to intercept
  style?: { color?: string; fill?: string; width?: number; height?: number }; // Uniwind will populate this
}

function BaseIcon({
  icon: Icon,
  strokeWidth,
  color,
  fill,
  size,
  ...rest
}: IconProps) {
  return (
    <Icon
      color={color}
      fill={fill || "none"}
      size={size}
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
}

export const StyledIcon = withUniwind(BaseIcon, {
  color: {
    fromClassName: "className",
    styleProperty: "color",
  },
  fill: {
    fromClassName: "className",
    styleProperty: "fill",
  },
  size: {
    fromClassName: "className",
    styleProperty: "width",
  },
});
