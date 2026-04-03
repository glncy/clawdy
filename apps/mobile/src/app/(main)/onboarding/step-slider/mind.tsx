import { Brain } from "phosphor-react-native";
import { SliderScreen } from "@/components/organisms/SliderScreen";

export default function SlideMind() {
  return (
    <SliderScreen
      index={4}
      icon={Brain}
      label="Growth"
      question="Are you growing and learning?"
      minLabel="Stagnant"
      maxLabel="Thriving"
      total={5}
      resultsRoute="/(main)/onboarding/step-result"
    />
  );
}
