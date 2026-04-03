import { UsersThree } from "phosphor-react-native";
import { SliderScreen } from "@/components/organisms/SliderScreen";

export default function SlidePeople() {
  return (
    <SliderScreen
      index={3}
      icon={UsersThree}
      label="Relationships"
      question="Are you connected to the people you care about?"
      minLabel="Disconnected"
      maxLabel="Close"
      total={5}
      nextRoute="/(main)/onboarding/step-slider/mind"
    />
  );
}
