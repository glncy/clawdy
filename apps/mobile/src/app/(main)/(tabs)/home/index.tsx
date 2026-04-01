import { ScrollView, View } from "react-native";
import { Stack } from "expo-router";
import { AppText } from "@/components/atoms/Text";
import { ScoreCard } from "@/components/molecules/ScoreCard";
import { BudgetCard } from "@/components/molecules/BudgetCard";
import { SparkCard } from "@/components/molecules/SparkCard";
import { NudgeCard } from "@/components/molecules/NudgeCard";
import { HabitList } from "@/components/organisms/HabitList";
import { VersionTap } from "@/components/molecules/VersionTap";
import {
  MOCK_CLAWDI_SCORE,
  MOCK_DOMAIN_SCORES,
  MOCK_BUDGET_LEFT,
  MOCK_DAILY_BUDGET,
  MOCK_HABITS,
  MOCK_SPARK,
  MOCK_CONTACTS,
} from "@/data/mockData";

export default function HomeScreen() {
  const nudgeContact = MOCK_CONTACTS.find((c) => c.lastTalkedDaysAgo >= 4);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-5 pt-16 pb-32 gap-5"
      >
        <View className="gap-1 pt-2">
          <AppText size="2xl" weight="bold" family="headline">
            Good morning, Glency
          </AppText>
          <AppText size="sm" color="muted">
            Ready for a peaceful day ahead?
          </AppText>
        </View>

        <ScoreCard score={MOCK_CLAWDI_SCORE} domains={MOCK_DOMAIN_SCORES} />

        <BudgetCard
          amountLeft={MOCK_BUDGET_LEFT}
          dailyBudget={MOCK_DAILY_BUDGET}
        />

        <HabitList habits={MOCK_HABITS} compact />

        <SparkCard
          text={MOCK_SPARK.text}
          domain={MOCK_SPARK.domain}
          isCompleted={MOCK_SPARK.isCompleted}
        />

        {nudgeContact && (
          <NudgeCard
            name={nudgeContact.name}
            daysAgo={nudgeContact.lastTalkedDaysAgo}
          />
        )}

        <VersionTap />
      </ScrollView>
    </>
  );
}
