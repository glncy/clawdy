import { ScrollView, View } from "react-native";
import { Stack } from "expo-router";
import { Card } from "heroui-native";
import { AppText } from "@/components/atoms/Text";
import { MoodSelector } from "@/components/organisms/MoodSelector";
import { HabitList } from "@/components/organisms/HabitList";
import { SleepCard } from "@/components/molecules/SleepCard";
import {
  MOCK_HABITS,
  MOCK_SLEEP,
  MOCK_STRESS_LEVEL,
  MOCK_WEEKLY_SLEEP_AVG,
} from "@/data/mockData";

export default function LifeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Life" }} />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-5 pt-20 pb-32 gap-5"
      >
        <AppText size="2xl" weight="bold" family="headline">
          Life
        </AppText>

        <MoodSelector />

        <HabitList habits={MOCK_HABITS} />

        {/* Stress Level */}
        <Card className="bg-surface p-4">
          <Card.Body className="gap-3">
            <AppText size="sm" weight="semibold" color="muted">
              Stress Level
            </AppText>
            <View className="flex-row items-center justify-between">
              <AppText size="xs" color="muted">Calm</AppText>
              <View className="mx-3 h-2 flex-1 overflow-hidden rounded-full bg-default">
                <View
                  className="h-full rounded-full bg-warning"
                  style={{ width: `${MOCK_STRESS_LEVEL * 10}%` }}
                />
              </View>
              <AppText size="xs" color="muted">High</AppText>
            </View>
            <AppText size="sm" color="muted" align="center">
              {MOCK_STRESS_LEVEL}/10
            </AppText>
          </Card.Body>
        </Card>

        <SleepCard
          hours={MOCK_SLEEP.hours}
          minutes={MOCK_SLEEP.minutes}
          weeklyAvg={MOCK_WEEKLY_SLEEP_AVG}
        />
      </ScrollView>
    </>
  );
}
