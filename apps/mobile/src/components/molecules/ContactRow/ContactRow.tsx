import { View } from "react-native";
import { AppText } from "@/components/atoms/Text";
import type { Contact } from "@/types";

interface ContactRowProps {
  contact: Contact;
}

export const ContactRow = ({ contact }: ContactRowProps) => {
  const needsAttention = contact.lastTalkedDaysAgo >= 4;

  return (
    <View className="flex-row items-center gap-3 py-3">
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${needsAttention ? "bg-danger/20" : "bg-primary/20"}`}
      >
        <AppText size="lg">{contact.name.charAt(0)}</AppText>
      </View>
      <View className="flex-1">
        <AppText size="sm" weight="medium">
          {contact.name}
        </AppText>
        <AppText size="xs" color="muted">
          Last talked {contact.lastTalkedDaysAgo} days ago
        </AppText>
      </View>
      <View
        className={`h-2.5 w-2.5 rounded-full ${needsAttention ? "bg-danger" : "bg-primary"}`}
      />
    </View>
  );
};
