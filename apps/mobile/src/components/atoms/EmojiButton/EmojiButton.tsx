import { Pressable } from "react-native";
import { AppText } from "@/components/atoms/Text";

interface EmojiButtonProps {
  emoji: string;
  isSelected: boolean;
  onPress: () => void;
}

export const EmojiButton = ({ emoji, isSelected, onPress }: EmojiButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={`items-center justify-center rounded-full p-2 ${
        isSelected ? "bg-primary/20 scale-110" : "bg-transparent"
      }`}
      style={{ width: 52, height: 52 }}
    >
      <AppText size={isSelected ? "2xl" : "xl"}>{emoji}</AppText>
    </Pressable>
  );
};
