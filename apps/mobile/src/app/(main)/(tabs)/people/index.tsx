import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Stack, router } from "expo-router";
import { Button } from "heroui-native";
import { AddressBook, Plus, UsersThree } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";
import { AppText } from "@/components/atoms/Text";
import { ContactList } from "@/components/organisms/ContactList";
import { HeaderGearButton } from "@/components/molecules/HeaderGearButton";
import { usePeopleData } from "@/hooks/usePeopleData";
import { importDeviceContact } from "@/services/importDeviceContact";

export default function PeopleScreen() {
  const { contacts, addContact } = usePeopleData();
  const [mutedColor, primaryForegroundColor] = useCSSVariable([
    "--color-muted",
    "--color-primary-foreground",
  ]);
  const [isImporting, setIsImporting] = useState(false);

  const openAddPerson = () => router.push("/(main)/add-person" as never);

  const handleImportFromContacts = async () => {
    if (isImporting) return;
    setIsImporting(true);
    try {
      const imported = await importDeviceContact();
      if (!imported) return;
      await addContact({
        name: imported.name,
        phone: imported.phone,
        nudgeFrequencyDays: 14,
        source: "device",
        deviceContactId: imported.deviceContactId,
      });
    } catch (err) {
      Alert.alert(
        "Couldn't import contact",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "People",
          headerRight: () => <HeaderGearButton tab="people" />,
        }}
      />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-5 pt-5 pb-32 gap-5"
      >
        {contacts.length === 0 ? (
          <View className="items-center gap-3 rounded-3xl bg-surface px-6 py-12">
            <UsersThree size={40} color={mutedColor as string} />
            <AppText
              size="lg"
              weight="semibold"
              align="center"
              family="headline"
            >
              Add the people who matter
            </AppText>
            <AppText size="sm" color="muted" align="center">
              Track interactions, remember birthdays, and stay connected to the
              people in your life.
            </AppText>
            <Button
              variant="primary"
              onPress={openAddPerson}
              className="mt-2"
            >
              <View className="flex-row items-center gap-1.5">
                <Plus
                  size={16}
                  weight="bold"
                  color={primaryForegroundColor as string}
                />
                <Button.Label>Add your first person</Button.Label>
              </View>
            </Button>
            <Button
              variant="tertiary"
              onPress={handleImportFromContacts}
              isDisabled={isImporting}
            >
              <View className="flex-row items-center gap-1.5">
                <AddressBook size={16} weight="bold" color={mutedColor as string} />
                <Button.Label>
                  {isImporting ? "Importing…" : "Import from Contacts"}
                </Button.Label>
              </View>
            </Button>
          </View>
        ) : (
          <ContactList contacts={contacts} />
        )}
      </ScrollView>
    </>
  );
}
