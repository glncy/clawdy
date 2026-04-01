import { Pressable } from "react-native";
import { AppText } from "@/components/atoms/Text";
import { CheckCircle, Circle } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";
import type { Priority } from "@/types";

interface PriorityRowProps {
  priority: Priority;
  onToggle?: () => void;
}

export const PriorityRow = ({ priority, onToggle }: PriorityRowProps) => {
  const [primaryColor, mutedColor] = useCSSVariable([
    "--color-primary",
    "--color-muted",
  ]);

  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center gap-3 py-2"
    >
      {priority.isCompleted ? (
        <CheckCircle size={22} weight="fill" color={primaryColor as string} />
      ) : (
        <Circle size={22} weight="regular" color={mutedColor as string} />
      )}
      <AppText
        size="sm"
        color={priority.isCompleted ? "muted" : "foreground"}
        className={priority.isCompleted ? "line-through" : ""}
      >
        {priority.text}
      </AppText>
    </Pressable>
  );
};
