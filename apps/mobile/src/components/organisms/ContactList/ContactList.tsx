import { View } from "react-native";
import { ContactRow } from "@/components/molecules/ContactRow";
import { AppText } from "@/components/atoms/Text";
import type { Contact } from "@/types";

interface ContactListProps {
  contacts: Contact[];
}

export const ContactList = ({ contacts }: ContactListProps) => {
  return (
    <View className="gap-1">
      <AppText size="lg" weight="semibold" family="headline">
        Recent Connections
      </AppText>
      {contacts.map((c) => (
        <ContactRow key={c.id} contact={c} />
      ))}
    </View>
  );
};
