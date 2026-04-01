import { View } from "react-native";
import { useState } from "react";
import { EmojiButton } from "@/components/atoms/EmojiButton";
import { AppText } from "@/components/atoms/Text";

const MOODS = ["😢", "😟", "😐", "😊", "😄"];

interface MoodSelectorProps {
  initialRating?: number;
  onSelect?: (rating: number) => void;
}

export const MoodSelector = ({
  initialRating = 4,
  onSelect,
}: MoodSelectorProps) => {
  const [selected, setSelected] = useState(initialRating - 1);

  const handleSelect = (index: number) => {
    setSelected(index);
    onSelect?.(index + 1);
  };

  return (
    <View className="gap-3">
      <AppText size="lg" weight="semibold" family="headline">
        How are you feeling?
      </AppText>
      <View className="flex-row justify-around">
        {MOODS.map((emoji, index) => (
          <EmojiButton
            key={emoji}
            emoji={emoji}
            isSelected={index === selected}
            onPress={() => handleSelect(index)}
          />
        ))}
      </View>
      <AppText size="xs" color="muted" align="center">
        You{"'"}ve been feeling good 3 days in a row
      </AppText>
    </View>
  );
};
