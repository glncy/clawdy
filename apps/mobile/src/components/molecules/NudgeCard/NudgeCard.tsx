import { View } from "react-native";
import { Card, Button } from "heroui-native";
import { AppText } from "@/components/atoms/Text";
import { Heart } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";

interface NudgeCardProps {
  name: string;
  daysAgo: number;
  onPress?: () => void;
}

export const NudgeCard = ({ name, daysAgo, onPress }: NudgeCardProps) => {
  const [dangerColor] = useCSSVariable(["--color-danger"]);

  return (
    <Card className="bg-danger/10 p-4">
      <Card.Body className="gap-3">
        <View className="flex-row items-start gap-3">
          <Heart size={20} weight="fill" color={dangerColor as string} />
          <View className="flex-1">
            <AppText size="sm">
              You haven{"'"}t talked to {name} in {daysAgo} days. Maybe reach out
              today?
            </AppText>
          </View>
        </View>
        <Button size="sm" variant="secondary" onPress={onPress}>
          <Button.Label>Message</Button.Label>
        </Button>
      </Card.Body>
    </Card>
  );
};
