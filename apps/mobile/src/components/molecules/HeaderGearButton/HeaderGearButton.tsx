import { Pressable } from "react-native";
import { GearSix } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";
import { useMoreSheetStore } from "@/stores/useMoreSheetStore";

/**
 * Gear icon button for the navigation header.
 * Opens the Settings sheet when pressed.
 * @level Molecule
 */
export function HeaderGearButton() {
  const toggle = useMoreSheetStore((s) => s.toggle);
  const [foregroundColor] = useCSSVariable(["--color-foreground"]);

  return (
    <Pressable onPress={toggle} hitSlop={8}>
      <GearSix size={22} weight="regular" color={foregroundColor as string} />
    </Pressable>
  );
}
