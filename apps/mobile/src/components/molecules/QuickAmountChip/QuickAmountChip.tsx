import { Chip } from "heroui-native";

interface QuickAmountChipProps {
  amount: number;
  currency?: string;
  onPress?: () => void;
}

export const QuickAmountChip = ({
  amount,
  currency = "$",
  onPress,
}: QuickAmountChipProps) => {
  return (
    <Chip variant="soft" className="px-1">
      <Chip.Label>
        {currency}
        {amount}
      </Chip.Label>
    </Chip>
  );
};
