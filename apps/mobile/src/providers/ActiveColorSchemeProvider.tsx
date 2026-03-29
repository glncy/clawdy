import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Appearance, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

interface ActiveColorSchemeContextType {
  activeColorScheme: ColorScheme;
  setActiveColorScheme: (scheme: ColorScheme) => void;
}

const ActiveColorSchemeContext =
  createContext<ActiveColorSchemeContextType | null>(null);

export function ActiveColorSchemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Initialize with device preference or fallback to 'light'
  const initialScheme = (Appearance.getColorScheme() ?? "light") as ColorScheme;
  const [activeColorScheme, setActiveColorScheme] =
    useState<ColorScheme>(initialScheme);

  const colorScheme = useColorScheme();

  useEffect(() => {
    if (colorScheme === "light" || colorScheme === "dark") {
      setActiveColorScheme(colorScheme);
    }
  }, [colorScheme]);

  return (
    <ActiveColorSchemeContext.Provider
      value={{ activeColorScheme, setActiveColorScheme }}
    >
      {children}
    </ActiveColorSchemeContext.Provider>
  );
}

export function useActiveColorScheme() {
  const context = useContext(ActiveColorSchemeContext);
  if (!context) {
    throw new Error(
      "useActiveColorScheme must be used within an ActiveColorSchemeProvider",
    );
  }
  return context;
}
