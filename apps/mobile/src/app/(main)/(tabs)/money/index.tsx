import { ScrollView, View } from "react-native";
import { Stack } from "expo-router";
import { Card } from "heroui-native";
import { AppText } from "@/components/atoms/Text";
import { BudgetCard } from "@/components/molecules/BudgetCard";
import { SavingsGoalCard } from "@/components/molecules/SavingsGoalCard";
import { TransactionList } from "@/components/organisms/TransactionList";
import {
  MOCK_BALANCE,
  MOCK_INCOME,
  MOCK_SPENT,
  MOCK_BUDGET_LEFT,
  MOCK_DAILY_BUDGET,
  MOCK_TRANSACTIONS,
  MOCK_SAVINGS_GOALS,
} from "@/data/mockData";

export default function MoneyScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Money" }} />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-5 pt-20 pb-32 gap-5"
      >
        <AppText size="2xl" weight="bold" family="headline">
          Money
        </AppText>
        <AppText size="xs" color="muted">
          Peaceful tracking for your day
        </AppText>

        {/* Balance Card */}
        <Card className="bg-surface p-5">
          <Card.Body className="gap-3">
            <AppText size="xs" color="muted">Available Balance</AppText>
            <AppText size="4xl" weight="bold" family="mono" selectable>
              ${MOCK_BALANCE.toLocaleString()}.00
            </AppText>
            <View className="flex-row gap-4">
              <View className="flex-row items-center gap-1">
                <AppText size="xs" color="primary">↑</AppText>
                <AppText size="xs" color="muted">Income ${MOCK_INCOME.toLocaleString()}</AppText>
              </View>
              <View className="flex-row items-center gap-1">
                <AppText size="xs" color="danger">↓</AppText>
                <AppText size="xs" color="muted">Spent ${MOCK_SPENT.toLocaleString()}</AppText>
              </View>
            </View>
          </Card.Body>
        </Card>

        {/* Quick Add Row */}
        <View className="flex-row gap-2">
          {[5, 10, 20, 50].map((amount) => (
            <View
              key={amount}
              className="flex-1 items-center rounded-lg bg-surface py-2"
            >
              <AppText size="sm" weight="medium" family="mono">
                ${amount}
              </AppText>
            </View>
          ))}
        </View>

        <BudgetCard amountLeft={MOCK_BUDGET_LEFT} dailyBudget={MOCK_DAILY_BUDGET} />

        <TransactionList transactions={MOCK_TRANSACTIONS} />

        <SavingsGoalCard goal={MOCK_SAVINGS_GOALS[0]} />
      </ScrollView>
    </>
  );
}
