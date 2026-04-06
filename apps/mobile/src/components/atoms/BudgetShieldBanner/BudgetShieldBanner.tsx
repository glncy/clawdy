import { View } from "react-native";
import { AppText } from "@/components/atoms/Text";
import { ShieldWarning } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";

interface BudgetShieldBannerProps {
  overAmount: number;
  currency?: string;
}

/**
 * Warning banner shown when daily budget is exceeded.
 * @level Atom
 */
export const BudgetShieldBanner = ({
  overAmount,
  currency = "$",
}: BudgetShieldBannerProps) => {
  const [dangerColor] = useCSSVariable(["--color-danger"]);

  if (overAmount <= 0) return null;

  return (
    <View className="flex-row items-center gap-2 rounded-lg bg-danger/10 px-3 py-2.5">
      <ShieldWarning size={18} weight="fill" color={dangerColor as string} />
      <AppText size="xs" color="danger">
        You{"'"}ve gone {currency}
        {overAmount.toFixed(0)} over today{"'"}s budget
      </AppText>
    </View>
  );
};
