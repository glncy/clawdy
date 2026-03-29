import { useResolveClassNames } from "uniwind";
import type { StyleProp, TextStyle } from "react-native";

type HeaderTitleStyle = StyleProp<
  Pick<TextStyle, "fontFamily" | "fontSize" | "fontWeight"> & {
    color?: string;
  }
>;

export function useTabHeaderTitleStyle(): HeaderTitleStyle {
  return useResolveClassNames("font-bold") as HeaderTitleStyle;
}
