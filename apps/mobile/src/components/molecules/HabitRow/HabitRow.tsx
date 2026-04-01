import { Pressable } from "react-native";
import { AppText } from "@/components/atoms/Text";
import { CheckSquare, Square } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";
import type { Habit } from "@/types";

interface HabitRowProps {
  habit: Habit;
  onToggle?: () => void;
}

export const HabitRow = ({ habit, onToggle }: HabitRowProps) => {
  const [primaryColor, mutedColor] = useCSSVariable([
    "--color-primary",
    "--color-muted",
  ]);

  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center gap-3 py-2"
    >
      {habit.isCompleted ? (
        <CheckSquare size={22} weight="fill" color={primaryColor as string} />
      ) : (
        <Square size={22} weight="regular" color={mutedColor as string} />
      )}
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
