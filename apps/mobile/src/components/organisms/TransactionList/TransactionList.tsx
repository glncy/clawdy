import { View } from "react-native";
import { TransactionRow } from "@/components/molecules/TransactionRow";
import { AppText } from "@/components/atoms/Text";
import type { Transaction } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
}

function getDateLabel(dateStr: string): string {
  const today = new Date();
  const date = new Date(dateStr + "T12:00:00");
  const todayStr = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (dateStr === todayStr) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupByDate(
  transactions: Transaction[]
): { date: string; label: string; items: Transaction[] }[] {
  const groups = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    const existing = groups.get(tx.date);
    if (existing) {
      existing.push(tx);
    } else {
      groups.set(tx.date, [tx]);
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      label: getDateLabel(date),
      items,
    }));
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  const grouped = groupByDate(transactions);

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <AppText size="sm" weight="semibold">
          Recent Activity
        </AppText>
        <AppText size="xs" color="primary" weight="medium">
          See all
        </AppText>
      </View>
      {grouped.map((group) => (
        <View key={group.date} className="gap-2">
          <AppText size="xs" color="muted" weight="medium">
            {group.label}
          </AppText>
          {group.items.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </View>
      ))}
    </View>
  );
};
