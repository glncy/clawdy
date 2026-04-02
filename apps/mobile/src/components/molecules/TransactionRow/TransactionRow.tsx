import { View } from "react-native";
import { AppText } from "@/components/atoms/Text";
import type { Transaction } from "@/types";

interface TransactionRowProps {
  transaction: Transaction;
}

export const TransactionRow = ({ transaction }: TransactionRowProps) => {
  return (
    <View className="flex-row items-center justify-between rounded-xl bg-surface p-3">
      <View className="flex-1 gap-0.5">
        <AppText size="sm" weight="medium">
          {transaction.item}
        </AppText>
        <AppText size="xs" color="muted">
          {transaction.category}
        </AppText>
      </View>
      <AppText size="sm" weight="semibold" family="mono" color="foreground" selectable>
        -{transaction.currency === "USD" ? "$" : transaction.currency}
        {transaction.amount.toFixed(2)}
      </AppText>
    </View>
  );
};
