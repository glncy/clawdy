import { View } from "react-native";
import { Card } from "heroui-native";
import { AppText } from "@/components/atoms/Text";
import type { SavingsGoal } from "@/types";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
}

export const SavingsGoalCard = ({ goal }: SavingsGoalCardProps) => {
  const progress = goal.currentAmount / goal.targetAmount;
  const currency = goal.currency === "USD" ? "$" : goal.currency;

  return (
    <Card className="bg-surface p-4">
      <Card.Body className="gap-2">
        <View className="flex-row items-center justify-between">
          <AppText size="sm" weight="semibold">
            {goal.name}
          </AppText>
          <AppText size="xs" color="muted">
            {goal.targetDate}
          </AppText>
        </View>
        <View className="flex-row items-baseline gap-1">
          <AppText size="lg" weight="bold" family="mono" selectable>
            {currency}
            {goal.currentAmount.toLocaleString()}
          </AppText>
          <AppText size="xs" color="muted">
            / {currency}
            {goal.targetAmount.toLocaleString()}
          </AppText>
        </View>
        <View className="h-2 overflow-hidden rounded-full bg-default">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </View>
      </Card.Body>
    </Card>
  );
};
