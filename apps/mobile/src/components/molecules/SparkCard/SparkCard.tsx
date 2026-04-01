import { View } from "react-native";
import { Card } from "heroui-native";
import { AppText } from "@/components/atoms/Text";
import { Lightning } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";

interface SparkCardProps {
  text: string;
  domain: string;
  isCompleted: boolean;
}

export const SparkCard = ({ text, domain, isCompleted }: SparkCardProps) => {
  const [primaryColor] = useCSSVariable(["--color-primary"]);

  return (
    <Card className="bg-primary/10 p-4">
      <Card.Body className="flex-row items-start gap-3">
        <Lightning size={20} weight="fill" color={primaryColor as string} />
        <View className="flex-1 gap-1">
          <AppText size="xs" color="primary" weight="semibold">
            clawdi Spark
          </AppText>
          <AppText size="sm">{text}</AppText>
        </View>
      </Card.Body>
    </Card>
  );
};
