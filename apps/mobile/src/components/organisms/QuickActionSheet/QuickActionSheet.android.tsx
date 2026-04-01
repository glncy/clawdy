import { View } from "react-native";
import { BottomSheet } from "heroui-native";
import { AppText } from "@/components/atoms/Text";
import {
  CurrencyDollar,
  Smiley,
  CheckSquare,
  ListBullets,
  Moon,
  ChatCircle,
} from "phosphor-react-native";
import { useCSSVariable } from "uniwind";
import { useQuickActionStore } from "@/stores/useQuickActionStore";

const ACTIONS = [
  { icon: CurrencyDollar, label: "Log expense" },
  { icon: Smiley, label: "Check in mood" },
  { icon: CheckSquare, label: "Tick a habit" },
  { icon: ListBullets, label: "Add priority" },
  { icon: Moon, label: "Log sleep" },
  { icon: ChatCircle, label: "Log a chat" },
];

export const QuickActionSheet = () => {
  const { isOpen, close } = useQuickActionStore();
  const [primaryColor] = useCSSVariable(["--color-primary"]);

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={(open) => !open && close()}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content className="pb-10">
          <BottomSheet.Title>Quick Actions</BottomSheet.Title>
          <View className="flex-row flex-wrap gap-3 px-4 py-4">
            {ACTIONS.map(({ icon: Icon, label }) => (
              <View
                key={label}
                className="w-[47%] items-center gap-2 rounded-xl bg-primary/10 p-4"
              >
                <Icon size={28} weight="fill" color={primaryColor as string} />
                <AppText size="xs" align="center" weight="medium">
                  {label}
                </AppText>
              </View>
            ))}
          </View>
          <BottomSheet.Close />
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};
