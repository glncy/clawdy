import { ScrollView, View } from "react-native";
import { Stack } from "expo-router";
import { Card } from "heroui-native";
import { AppText } from "@/components/atoms/Text";
import { NudgeCard } from "@/components/molecules/NudgeCard";
import { ContactList } from "@/components/organisms/ContactList";
import { MOCK_CONTACTS } from "@/data/mockData";

export default function PeopleScreen() {
  const nudgeContact = MOCK_CONTACTS.find((c) => c.lastTalkedDaysAgo >= 4);
  const upcomingBirthday = MOCK_CONTACTS.find((c) => c.birthday);

  return (
    <>
      <Stack.Screen options={{ title: "People" }} />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-5 pt-20 pb-32 gap-5"
      >
        <AppText size="2xl" weight="bold" family="headline">
          People
        </AppText>

        {nudgeContact && (
          <NudgeCard
            name={nudgeContact.name}
            daysAgo={nudgeContact.lastTalkedDaysAgo}
          />
        )}

        <ContactList contacts={MOCK_CONTACTS} />

        {/* Upcoming Birthdays */}
        {upcomingBirthday && (
          <View className="gap-2">
            <AppText size="sm" weight="semibold" color="muted">
              Upcoming birthdays
            </AppText>
            <Card className="bg-surface p-4">
              <Card.Body className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <AppText size="xs" color="muted" align="center">
                    {upcomingBirthday.birthday?.split(" ")[0]}
                  </AppText>
                  <AppText size="sm" weight="bold">
                    {upcomingBirthday.birthday?.split(" ")[1]}
                  </AppText>
                </View>
                <View className="flex-1">
                  <AppText size="sm" weight="medium">
                    {upcomingBirthday.name}{"'"}s Birthday
                  </AppText>
                  {upcomingBirthday.giftIdea && (
                    <AppText size="xs" color="muted">
                      Gift idea: {upcomingBirthday.giftIdea}
                    </AppText>
                  )}
                </View>
              </Card.Body>
            </Card>
          </View>
        )}
      </ScrollView>
    </>
  );
}
