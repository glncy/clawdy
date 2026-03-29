import { useSystemTheme } from "@/hooks/useCustomTheme";
import { Redirect } from "expo-router";

export default function Index() {
  useSystemTheme();
  return <Redirect href="/(main)/(tabs)/home" />;
}
