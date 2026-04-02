import { View } from "react-native";
import { PriorityRow } from "@/components/molecules/PriorityRow";
import { AppText } from "@/components/atoms/Text";
import type { Priority } from "@/types";

interface PriorityListProps {
  priorities: Priority[];
}

export const PriorityList = ({ priorities }: PriorityListProps) => {
  const completed = priorities.filter((p) => p.isCompleted).length;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <AppText size="lg" weight="semibold" family="headline">
          Top Priorities
        </AppText>
        <AppText size="xs" color="muted">
          {completed} of {priorities.length} done
        </AppText>
      </View>
      {priorities.map((p) => (
        <PriorityRow key={p.id} priority={p} />
      ))}
    </View>
  );
};
