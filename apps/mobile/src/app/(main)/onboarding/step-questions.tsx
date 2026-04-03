import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/atoms/Text";
import { Button, Card, Input } from "heroui-native";
import { PhosphorIcon } from "@/components/atoms/PhosphorIcon";
import { CheckCircle } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";
import { useOnboarding, DOWNLOAD_BAR_PADDING } from "./_layout";

const SAVING_GOALS = [
  { label: "Emergency Fund", emoji: "🏦" },
  { label: "Travel", emoji: "✈️" },
  { label: "House", emoji: "🏠" },
  { label: "Debt Payoff", emoji: "💳" },
];

const STRUGGLES = [
  { label: "Saving money", emoji: "💸" },
  { label: "Sleeping well", emoji: "😴" },
  { label: "Staying focused", emoji: "🎯" },
  { label: "Finding time", emoji: "⏰" },
];

const STEP_META = [
  { emoji: "💰", label: "Finances" },
  { emoji: "🎯", label: "Goals" },
  { emoji: "⚡", label: "Daily Life" },
];

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View className="flex-row items-center justify-center gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`rounded-full ${
            i < current
              ? "w-3 h-3 bg-primary"
              : i === current
                ? "w-3.5 h-3.5 bg-primary"
                : "w-3 h-3 border-2 border-border"
          }`}
        />
      ))}
    </View>
  );
}

function SelectionCard({
  emoji,
  label,
  isSelected,
  onPress,
}: {
  emoji: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const [primaryColor] = useCSSVariable(["--color-primary"]);

  return (
    <Pressable onPress={onPress}>
      <Card
        className={`rounded-xl ${
          isSelected ? "bg-primary/10" : "bg-surface"
        }`}
      >
        <Card.Body className="flex-row items-center justify-between px-4 py-4">
          <View className="flex-row items-center gap-3">
            <AppText size="lg">{emoji}</AppText>
            <AppText weight="medium">{label}</AppText>
          </View>
          {isSelected && (
            <PhosphorIcon
              icon={CheckCircle}
              weight="fill"
              size={24}
              color={primaryColor as string}
            />
          )}
        </Card.Body>
      </Card>
    </Pressable>
  );
}

export default function OnboardingStepQuestions() {
  const router = useRouter();
  const { income, setIncome, savingGoal, setSavingGoal, struggle, setStruggle, isDownloadBarVisible } =
    useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);

  const stepMeta = STEP_META[currentStep];

  const handleNext = () => {
    if (currentStep === 0 && income) {
      setCurrentStep(1);
    } else if (currentStep === 1 && savingGoal) {
      setCurrentStep(2);
    } else if (currentStep === 2 && struggle) {
      router.push("/(main)/onboarding/step-score");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 0) return !income;
    if (currentStep === 1) return !savingGoal;
    if (currentStep === 2) return !struggle;
    return true;
  };

  return (
    <View
      className="flex-1 bg-background px-6 pt-16 pb-12"
      style={isDownloadBarVisible ? { paddingBottom: DOWNLOAD_BAR_PADDING } : undefined}
    >
      {/* Step dots */}
      <StepDots current={currentStep} total={3} />

      {/* Domain chip */}
      <View className="items-center mt-8 mb-6">
        <View className="flex-row items-center gap-2 bg-primary/10 rounded-full px-5 py-2.5">
          <AppText size="base">{stepMeta.emoji}</AppText>
          <AppText size="sm" weight="semibold" color="primary">
            {stepMeta.label}
          </AppText>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingBottom: 80 }}
      >
        {currentStep === 0 && (
          <View className="gap-6">
            <AppText
              size="2xl"
              weight="bold"
              family="headline"
              align="center"
            >
              What is your monthly income?
            </AppText>
            <Card className="bg-surface rounded-2xl mx-2">
              <Card.Body className="p-5">
                <Input
                  value={income}
                  onChangeText={(text: string) => setIncome(text)}
                  keyboardType="decimal-pad"
                  placeholder="$ 0.00"
                  autoFocus
                  className="text-center"
                />
              </Card.Body>
            </Card>
          </View>
        )}

        {currentStep === 1 && (
          <View className="gap-6">
            <AppText
              size="2xl"
              weight="bold"
              family="headline"
              align="center"
            >
              What are you saving for?
            </AppText>
            <View className="gap-3">
              {SAVING_GOALS.map((goal) => (
                <SelectionCard
                  key={goal.label}
                  emoji={goal.emoji}
                  label={goal.label}
                  isSelected={savingGoal === goal.label}
                  onPress={() => setSavingGoal(goal.label)}
                />
              ))}
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View className="gap-6">
            <AppText
              size="2xl"
              weight="bold"
              family="headline"
              align="center"
            >
              What is your biggest daily struggle?
            </AppText>
            <View className="gap-3">
              {STRUGGLES.map((s) => (
                <SelectionCard
                  key={s.label}
                  emoji={s.emoji}
                  label={s.label}
                  isSelected={struggle === s.label}
                  onPress={() => setStruggle(s.label)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View className="flex-row justify-between gap-4 pt-4">
        <Button
          variant="tertiary"
          className="flex-1 h-14 rounded-2xl"
          onPress={handleBack}
        >
          <Button.Label>Back</Button.Label>
        </Button>
        <Button
          variant="primary"
          className="flex-1 h-14 rounded-2xl"
          onPress={handleNext}
          isDisabled={isNextDisabled()}
        >
          <Button.Label>
            {currentStep === 2 ? "Finish" : "Next"}
          </Button.Label>
        </Button>
      </View>
    </View>
  );
}
