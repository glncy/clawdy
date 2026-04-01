import { View } from "react-native";
import { Card } from "heroui-native";
import { AppText } from "@/components/atoms/Text";
import { Moon } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";

interface SleepCardProps {
  hours: number;
  minutes: number;
  weeklyAvg: number;
}

export const SleepCard = ({ hours, minutes, weeklyAvg }: SleepCardProps) => {
  const [primaryColor] = useCSSVariable(["--color-primary"]);

  return (
    <Card className="bg-surface p-4">
      <Card.Body className="gap-2">
        <View className="flex-row items-center gap-2">
          <Moon size={18} weight="fill" color={primaryColor as string} />
          <AppText size="xs" color="muted" weight="semibold">
            Sleep
          </AppText>
        </View>
        <View className="flex-row items-baseline gap-1">
          <AppText size="2xl" weight="bold" family="mono">
            {hours}h {minutes}m
          </AppText>
          <AppText size="xs" color="muted">
            last night
          </AppText>
        </View>
        <AppText size="xs" color="muted">
          Weekly avg: {weeklyAvg}h
        </AppText>
      </Card.Body>
    </Card>
  );
};
