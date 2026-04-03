import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { useSystemTheme } from "@/hooks/useCustomTheme";
import { useLocalAI } from "@/hooks/useLocalAI";
import { AppText } from "@/components/atoms/Text";
import { PhosphorIcon } from "@/components/atoms/PhosphorIcon";
import { Brain, CheckCircle } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Portal } from "heroui-native";

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
  /** Whether the AI download bar is visible — screens should add bottom padding */
  isDownloadBarVisible: boolean;
}

const OnboardingContext = createContext<OnboardingData | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingLayout");
  }
  return ctx;
}

// --- Download Bar ---

const DOWNLOAD_BAR_HEIGHT = 64;
function DownloadBar() {
  const { downloadModel, downloadProgress, isModelDownloaded, status } =
    useLocalAI();
  const [primaryColor] = useCSSVariable(["--color-primary"]);
  const insets = useSafeAreaInsets();
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    if (!isModelDownloaded && status !== "downloading") {
      downloadModel();
    }
  }, [isModelDownloaded, status, downloadModel]);

  useEffect(() => {
    if (isModelDownloaded) {
      setShowDone(true);
      const timer = setTimeout(() => setShowDone(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isModelDownloaded]);

  if (isModelDownloaded && !showDone) return null;

  const percentage = Math.round(downloadProgress * 100);

  return (
    <Portal name="download-bar">
      <View
        className="bg-surface border-t border-border"
        style={{ paddingBottom: insets.bottom }}
      >
        <View
          className="flex-row items-center gap-3 px-5"
          style={{ height: DOWNLOAD_BAR_HEIGHT }}
        >
          {isModelDownloaded ? (
            <PhosphorIcon
              icon={CheckCircle}
              weight="fill"
              size={24}
              color={primaryColor as string}
            />
          ) : (
            <PhosphorIcon
              icon={Brain}
              weight="duotone"
              size={24}
              color={primaryColor as string}
            />
          )}

          <View className="flex-1 gap-1">
            <AppText size="sm" weight="medium">
              {isModelDownloaded
                ? "On-device AI ready"
                : "Setting up on-device AI"}
            </AppText>
            {!isModelDownloaded ? (
              <View className="w-full h-1.5 bg-default rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </View>
            ) : (
              <AppText size="xs" color="muted">
                No cloud, full privacy.
              </AppText>
            )}
          </View>

          {!isModelDownloaded && percentage > 0 && (
            <AppText size="xs" weight="semibold" family="mono" color="primary">
              {percentage}%
            </AppText>
          )}
        </View>
      </View>
    </Portal>
  );
}

// --- Provider ---

function OnboardingProvider({ children }: { children: ReactNode }) {
  const [sliderValues, setSliderValues] = useState<number[]>([
    50, 50, 50, 50, 50,
  ]);
  const [income, setIncome] = useState("");
  const [savingGoal, setSavingGoal] = useState("");
  const [struggle, setStruggle] = useState("");
  const { isModelDownloaded } = useLocalAI();
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    if (isModelDownloaded) {
      setShowDone(true);
      const timer = setTimeout(() => setShowDone(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isModelDownloaded]);

  const isDownloadBarVisible = !isModelDownloaded || showDone;

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
        isDownloadBarVisible,
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
      <View className="flex-1">
        <Stack.Screen options={{ headerShown: false }} />
        <Stack
          screenOptions={{ headerShown: false, animation: "slide_from_right" }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="step-sliders" />
          <Stack.Screen name="step-result" />
          <Stack.Screen name="step-questions" />
          <Stack.Screen name="step-score" />
        </Stack>
        <DownloadBar />
      </View>
    </OnboardingProvider>
  );
}

/** Bottom padding screens should apply when download bar is visible */
export const DOWNLOAD_BAR_PADDING = DOWNLOAD_BAR_HEIGHT + 8;
