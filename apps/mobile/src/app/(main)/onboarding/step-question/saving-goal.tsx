import { Target } from "phosphor-react-native";
import { QuestionScreen } from "@/components/organisms/QuestionScreen";
import { useOnboarding } from "../_layout";

const SAVING_GOALS = [
  { label: "Emergency Fund", emoji: "🏦" },
  { label: "Travel", emoji: "✈️" },
  { label: "House", emoji: "🏠" },
  { label: "Debt Payoff", emoji: "💳" },
];

export default function QuestionSavingGoal() {
  const { savingGoal, setSavingGoal } = useOnboarding();

  return (
    <QuestionScreen
      index={1}
      total={3}
      icon={Target}
      label="Goals"
      question="What are you saving for?"
      value={savingGoal}
      onValueChange={setSavingGoal}
      nextRoute="/(main)/onboarding/step-question/struggle"
      options={SAVING_GOALS}
    />
  );
}
