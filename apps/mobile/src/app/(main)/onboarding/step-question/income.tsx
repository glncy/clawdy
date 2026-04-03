import { CurrencyDollar } from "phosphor-react-native";
import { QuestionScreen } from "@/components/organisms/QuestionScreen";
import { useOnboarding } from "../_layout";

export default function QuestionIncome() {
  const { income, setIncome } = useOnboarding();

  return (
    <QuestionScreen
      index={0}
      total={3}
      icon={CurrencyDollar}
      label="Finances"
      question="What is your monthly income?"
      value={income}
      onValueChange={setIncome}
      nextRoute="/(main)/onboarding/step-question/saving-goal"
      inputProps={{
        keyboardType: "decimal-pad",
        placeholder: "$ 0.00",
      }}
    />
  );
}
