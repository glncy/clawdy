import { Clock } from "phosphor-react-native";
import { SliderScreen } from "@/components/organisms/SliderScreen";

export default function SlideTime() {
  return (
    <SliderScreen
      index={1}
      icon={Clock}
      label="Time"
      question="Do you feel like you control your own time?"
      minLabel="Overwhelmed"
      maxLabel="In control"
      total={5}
      nextRoute="/(main)/onboarding/step-slider/health"
    />
  );
}
