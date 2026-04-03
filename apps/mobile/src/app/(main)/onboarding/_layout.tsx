import { createContext, useContext, useState, type ReactNode } from "react";
import { Stack } from "expo-router";
import { useSystemTheme } from "@/hooks/useCustomTheme";

// --- Onboarding Context ---

interface OnboardingData {
  sliderValues: number[];
  setSliderValues: (values: number[]) => void;
  income: string;
  setIncome: (v: string) => void;
  savingGoal: string;
  setSavingGoal: (v: string) => void;
  struggle: string;
  setStruggle: (v: string) => void;
}

const OnboardingContext = createContext<OnboardingData | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingLayout");
  }
  return ctx;
}

function OnboardingProvider({ children }: { children: ReactNode }) {
  const [sliderValues, setSliderValues] = useState<number[]>([50, 50, 50, 50, 50]);
  const [income, setIncome] = useState("");
  const [savingGoal, setSavingGoal] = useState("");
  const [struggle, setStruggle] = useState("");

  return (
    <OnboardingContext.Provider
      value={{
        sliderValues,
        setSliderValues,
        income,
        setIncome,
        savingGoal,
        setSavingGoal,
        struggle,
        setStruggle,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

// --- Layout ---

export default function OnboardingLayout() {
  useSystemTheme();

  return (
    <OnboardingProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="step-sliders" />
        <Stack.Screen name="step-result" />
        <Stack.Screen name="step-questions" />
        <Stack.Screen name="step-score" />
      </Stack>
    </OnboardingProvider>
  );
}
