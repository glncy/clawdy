import { Text as RNText, TextProps } from "react-native";
import { tv } from "tailwind-variants";

// Let's create a temporary typings if needed, or just let users pass tailwind colors as strings.
type AppTextWeight =
  | "thin"
  | "extralight"
  | "light"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black";

interface AppTextProps extends TextProps {
  size?:
    | "xs"
    | "sm"
    | "base"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl";
  color?:
    | "primary"
    | "secondary"
    | "accent"
    | "danger"
    | "background"
    | "foreground"
    | "surface"
    | "text"
    | "muted"
    | "primary-foreground"
    | "border"
    | null;
  align?: "auto" | "left" | "center" | "right" | "justify";
  weight?: AppTextWeight;
}

const appText = tv({
  base: "",
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
      "6xl": "text-6xl",
    },
    color: {
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent",
      danger: "text-danger",
      background: "text-background",
      foreground: "text-foreground",
      surface: "text-surface",
      text: "text-text",
      muted: "text-muted",
      "primary-foreground": "text-primary-foreground",
      border: "text-border",
    },
    align: {
      auto: "",
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
    weight: {
      thin: "font-thin",
      extralight: "font-extralight",
      light: "font-light",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
      black: "font-black",
    },
  },
  defaultVariants: {
    size: "base",
    color: "foreground",
    align: "left",
  },
});

/**
 * App Text Component
 * @level Atom
 */
export const AppText = ({
  size = "base",
  color = "foreground",
  align = "left",
  weight,
  style,
  children,
  className,
  ...props
}: AppTextProps & { className?: string }) => {
  const combinedClasses = appText({
    size,
    color: color ?? undefined,
    align,
    weight,
    className,
  });

  return (
    <RNText className={combinedClasses} style={style} {...props}>
      {children}
    </RNText>
  );
};
