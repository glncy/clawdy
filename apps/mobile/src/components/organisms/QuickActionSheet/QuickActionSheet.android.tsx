import { View } from "react-native";
import {
  ModalBottomSheet,
  Host,
  RNHostView,
} from "@expo/ui/jetpack-compose";
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

  if (!isOpen) return null;

  return (
    <Host style={{ position: "absolute", width: "100%", height: "100%" }}>
      <ModalBottomSheet onDismissRequest={close} showDragHandle>
        <RNHostView matchContents>
          <View className="gap-4 px-4 py-6">
            <AppText size="lg" weight="bold" family="headline">
              Quick Actions
            </AppText>
            <View className="flex-row flex-wrap gap-3">
              {ACTIONS.map(({ icon: Icon, label }) => (
                <View
                  key={label}
                  className="w-[47%] items-center gap-2 rounded-xl bg-primary/10 p-4"
                >
                  <Icon
                    size={28}
                    weight="fill"
                    color={primaryColor as string}
                  />
                  <AppText size="xs" align="center" weight="medium">
                    {label}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        </RNHostView>
      </ModalBottomSheet>
    </Host>
  );
};
