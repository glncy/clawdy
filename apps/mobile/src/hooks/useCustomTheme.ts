import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { Uniwind, useUniwind } from "uniwind";
import { useActiveColorScheme } from "@/providers/ActiveColorSchemeProvider";

type ThemeVariants = Parameters<typeof Uniwind.setTheme>[0];

/**
 * A hook to apply custom light and dark themes dynamically when a screen is focused.
 * It reliably responds to the explicitly managed ActiveColorSchemeProvider state,
 * bypassing device-level UI intercept race conditions.
 *
 * @param lightTheme - The theme to apply in light mode.
 * @param darkTheme - The optional theme to apply in dark mode. Falls back to lightTheme.
 */
export function useCustomTheme(
  lightTheme: ThemeVariants,
  darkTheme?: ThemeVariants,
) {
  const { theme } = useUniwind();
  const { activeColorScheme } = useActiveColorScheme();

  useFocusEffect(
    useCallback(() => {
      const activeDarkTheme = darkTheme ?? lightTheme;
      const targetTheme = (
        activeColorScheme === "dark" ? activeDarkTheme : lightTheme
      ) as ThemeVariants;

      if (theme !== targetTheme) {
        Uniwind.setTheme(targetTheme);
      }
    }, [theme, activeColorScheme, lightTheme, darkTheme]),
  );
}

/**
 * A hook to revert the app theme back to the standard global strict state ("light" | "dark")
 * managed by the ActiveColorSchemeProvider when a screen is focused.
 */
export function useSystemTheme() {
  const { theme } = useUniwind();
  const { activeColorScheme } = useActiveColorScheme();

  useFocusEffect(
    useCallback(() => {
      if (theme !== activeColorScheme) {
        // Re-enforce the underlying global active scheme
        Uniwind.setTheme(activeColorScheme);
        Uniwind.setTheme("system");
      }
    }, [theme, activeColorScheme]),
  );
}
