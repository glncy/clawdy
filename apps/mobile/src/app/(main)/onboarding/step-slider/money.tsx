import { CurrencyDollar } from "phosphor-react-native";
import { SliderScreen } from "@/components/organisms/SliderScreen";

export default function SlideMoney() {
  return (
    <SliderScreen
      index={0}
      icon={CurrencyDollar}
      label="Finances"
      question="How do you feel about your finances right now?"
      minLabel="Stressed"
      maxLabel="Secure"
      total={5}
      nextRoute="/(main)/onboarding/step-slider/time"
    />
  );
}
