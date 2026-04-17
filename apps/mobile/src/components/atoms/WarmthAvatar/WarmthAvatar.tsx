import { View } from "react-native";
import { AppText } from "@/components/atoms/Text";
import { initialsFromName, type WarmthLevel } from "@/utils/warmth";

interface WarmthAvatarProps {
  name: string;
  warmth: WarmthLevel;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
} as const;

const TEXT_SIZE = {
  sm: "xs",
  md: "sm",
  lg: "base",
} as const;

const RING_CLASSES: Record<WarmthLevel, string> = {
  warm: "border-primary bg-primary/15",
  cooling: "border-warning bg-warning/15",
  distant: "border-muted bg-muted/15",
};

export const WarmthAvatar = ({
  name,
  warmth,
  size = "md",
}: WarmthAvatarProps) => {
  const initials = initialsFromName(name);

  return (
    <View
      className={`${SIZE_CLASSES[size]} items-center justify-center rounded-full border-2 ${RING_CLASSES[warmth]}`}
    >
      <AppText size={TEXT_SIZE[size]} weight="semibold">
        {initials}
      </AppText>
    </View>
  );
};
