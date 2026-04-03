import { Heartbeat } from "phosphor-react-native";
import { SliderScreen } from "@/components/organisms/SliderScreen";

export default function SlideHealth() {
  return (
    <SliderScreen
      index={2}
      icon={Heartbeat}
      label="Health"
      question="How is your daily energy and health?"
      minLabel="Exhausted"
      maxLabel="Vibrant"
      total={5}
      nextRoute="/(main)/onboarding/step-slider/people"
    />
  );
}
