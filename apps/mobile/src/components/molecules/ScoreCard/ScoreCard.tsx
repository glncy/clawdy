import { View } from "react-native";
import { Card } from "heroui-native";
import { ProgressRing } from "@/components/atoms/ProgressRing";
import { DomainBar } from "@/components/atoms/DomainBar";
import { AppText } from "@/components/atoms/Text";
import type { DomainScore } from "@/types";

interface ScoreCardProps {
  score: number;
  domains: DomainScore[];
}

export const ScoreCard = ({ score, domains }: ScoreCardProps) => {
  return (
    <Card className="bg-surface p-5">
      <Card.Body className="items-center gap-4">
        <ProgressRing progress={score / 100} size={140} strokeWidth={10}>
          <View className="items-center">
            <AppText size="4xl" weight="bold" family="mono">
              {score}
            </AppText>
            <AppText size="xs" color="muted">
              clawdi Score
            </AppText>
          </View>
        </ProgressRing>
        <View className="w-full gap-2">
          <AppText size="xs" color="muted" weight="semibold">
            Domains
          </AppText>
          {domains.map((domain) => (
            <DomainBar
              key={domain.label}
              label={domain.label}
              icon={domain.icon}
              progress={domain.progress}
            />
          ))}
        </View>
      </Card.Body>
    </Card>
  );
};
