import { Pressable } from "react-native";
import { AppText } from "@/components/atoms/Text";
import { Checkbox } from "heroui-native";
import type { Priority } from "@/types";

interface PriorityRowProps {
  priority: Priority;
  onToggle?: () => void;
}

export const PriorityRow = ({ priority, onToggle }: PriorityRowProps) => {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center gap-3 py-2"
    >
      <Checkbox isSelected={priority.isCompleted} onChange={onToggle} />
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
