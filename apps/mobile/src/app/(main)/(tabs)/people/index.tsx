import { ScrollView, View } from "react-native";
import { Stack, router } from "expo-router";
import { Button } from "heroui-native";
import { Plus, UsersThree } from "phosphor-react-native";
import { useCSSVariable } from "uniwind";
import { AppText } from "@/components/atoms/Text";
import { ContactList } from "@/components/organisms/ContactList";
import { HeaderGearButton } from "@/components/molecules/HeaderGearButton";
import { usePeopleData } from "@/hooks/usePeopleData";

export default function PeopleScreen() {
  const { contacts } = usePeopleData();
  const [mutedColor] = useCSSVariable(["--color-muted"]);

  const openAddPerson = () => router.push("/(main)/add-person" as never);

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
        <View className="flex-row items-center justify-between">
          <AppText size="2xl" weight="bold" family="headline">
            People
          </AppText>
          <Button variant="primary" size="sm" onPress={openAddPerson}>
            <View className="flex-row items-center gap-1.5">
              <Plus size={16} weight="bold" color="#fff" />
              <Button.Label>Add</Button.Label>
            </View>
          </Button>
        </View>

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
                <Plus size={16} weight="bold" color="#fff" />
                <Button.Label>Add your first person</Button.Label>
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
