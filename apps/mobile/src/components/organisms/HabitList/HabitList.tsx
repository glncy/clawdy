import { View } from "react-native";
import { HabitRow } from "@/components/molecules/HabitRow";
import { ProgressRing } from "@/components/atoms/ProgressRing";
import { AppText } from "@/components/atoms/Text";
import type { Habit } from "@/types";

interface HabitListProps {
  habits: Habit[];
  compact?: boolean;
}

export const HabitList = ({ habits, compact = false }: HabitListProps) => {
  const completed = habits.filter((h) => h.isCompleted).length;
  const total = habits.length;
  const progress = total > 0 ? completed / total : 0;

  if (compact) {
    return (
      <View className="flex-row items-center gap-3 rounded-xl bg-surface p-4">
        <ProgressRing progress={progress} size={48} strokeWidth={4}>
          <AppText size="xs" weight="bold" family="mono">
            {completed}/{total}
          </AppText>
        </ProgressRing>
        <View>
          <AppText size="sm" weight="medium">
            Habits
          </AppText>
          <AppText size="xs" color="muted">
            {completed} of {total} done
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <AppText size="lg" weight="semibold" family="headline">
          Today{"'"}s Habits
        </AppText>
        <ProgressRing progress={progress} size={36} strokeWidth={3}>
          <AppText size="xs" weight="bold" family="mono" color="muted">
            {completed}/{total}
          </AppText>
        </ProgressRing>
      </View>
      {habits.map((habit) => (
        <HabitRow key={habit.id} habit={habit} />
      ))}
    </View>
  );
};
