import { View } from "react-native";
import { AppText } from "@/components/atoms/Text";

interface DomainBarProps {
  label: string;
  icon: string;
  progress: number; // 0 to 1
}

export const DomainBar = ({ label, icon, progress }: DomainBarProps) => {
  const percentage = Math.round(progress * 100);

  return (
    <View className="flex-row items-center gap-2">
      <AppText size="sm">{icon}</AppText>
      <AppText size="xs" color="muted" className="w-12">
        {label}
      </AppText>
      <View className="h-2 flex-1 overflow-hidden rounded-full bg-default">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </View>
      <AppText size="xs" color="muted" family="mono" className="w-8 text-right">
        {percentage}%
      </AppText>
    </View>
  );
};
