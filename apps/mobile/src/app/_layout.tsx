import "../global.css";
import { Stack } from "expo-router";
import { HeroUINativeProvider, useThemeColor } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootProviders } from "../providers/RootProviders";
import { StatusBar } from "expo-status-bar";
import { useFonts, Syne_800ExtraBold } from "@expo-google-fonts/syne";
import {
  Poppins_100Thin,
  Poppins_200ExtraLight,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from "@expo-google-fonts/poppins";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  ActiveColorSchemeProvider,
  useActiveColorScheme,
} from "../providers/ActiveColorSchemeProvider";
import React from "react";
import { useSystemTheme } from "@/hooks/useCustomTheme";

function AppNavigationProvider({ children }: { children: React.ReactNode }) {
  const { activeColorScheme } = useActiveColorScheme();
  const isDark = activeColorScheme === "dark";

  const [
    colorPrimary,
    colorBackground,
    colorSurface,
    colorForeground,
    colorBorder,
    colorDanger,
  ] = useThemeColor([
    "accent",
    "background",
    "surface",
    "foreground",
    "border",
    "danger",
  ]);

  const navTheme = {
    dark: isDark,
    colors: {
      primary: colorPrimary,
      background: colorBackground,
      card: colorSurface,
      text: colorForeground,
      border: colorBorder,
      notification: colorDanger,
    },
    fonts: DefaultTheme.fonts,
  };

  return <ThemeProvider value={navTheme}>{children}</ThemeProvider>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Syne_800ExtraBold,
    Poppins_100Thin,
    Poppins_200ExtraLight,
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  if (!loaded && !error) {
    return null;
  }

  return (
    <RootProviders
      providers={[
        (props) => <GestureHandlerRootView {...props} style={{ flex: 1 }} />,
        (props) => <ActiveColorSchemeProvider {...props} />,
        (props) => <HeroUINativeProvider {...props} />,
        (props) => <KeyboardProvider {...props} />,
        (props) => <AppNavigationProvider {...props} />,
      ]}
    >
      <StatusBar style="auto" />
      <Stack />
    </RootProviders>
  );
}
