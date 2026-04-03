import { Lightning } from "phosphor-react-native";
import { QuestionScreen } from "@/components/organisms/QuestionScreen";
import { useOnboarding } from "../_layout";

const STRUGGLES = [
  { label: "Saving money", emoji: "💸" },
  { label: "Sleeping well", emoji: "😴" },
  { label: "Staying focused", emoji: "🎯" },
  { label: "Finding time", emoji: "⏰" },
];

export default function QuestionStruggle() {
  const { struggle, setStruggle } = useOnboarding();

  return (
    <QuestionScreen
      index={2}
      total={3}
      icon={Lightning}
      label="Daily Life"
      question="What is your biggest daily struggle?"
      value={struggle}
      onValueChange={setStruggle}
      nextRoute="/(main)/onboarding/step-focus"
      isLast
      options={STRUGGLES}
    />
  );
}
