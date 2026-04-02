import { View } from "react-native";
import { TransactionRow } from "@/components/molecules/TransactionRow";
import { AppText } from "@/components/atoms/Text";
import type { Transaction } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <AppText size="sm" weight="semibold" color="muted">
          Recent activity
        </AppText>
        <AppText size="xs" color="primary">
          View all
        </AppText>
      </View>
      <View className="gap-2">
        {transactions.map((tx) => (
          <TransactionRow key={tx.id} transaction={tx} />
        ))}
      </View>
    </View>
  );
};
