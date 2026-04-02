import { Pressable } from "react-native";
import { AppText } from "@/components/atoms/Text";
import { Checkbox } from "heroui-native";
import type { Habit } from "@/types";

interface HabitRowProps {
  habit: Habit;
  onToggle?: () => void;
}

export const HabitRow = ({ habit, onToggle }: HabitRowProps) => {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center gap-3 py-2"
    >
      <Checkbox isSelected={habit.isCompleted} onChange={onToggle} />
      <AppText size="sm">{habit.icon}</AppText>
      <AppText
        size="sm"
        color={habit.isCompleted ? "muted" : "foreground"}
        className={habit.isCompleted ? "line-through" : ""}
      >
        {habit.name}
      </AppText>
    </Pressable>
  );
};
