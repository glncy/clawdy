import { useState } from "react";
import { ScrollView, View, TextInput, Pressable } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Plus } from "phosphor-react-native";
import { Button } from "heroui-native";
import { useCSSVariable } from "uniwind";
import { AppText } from "@/components/atoms/Text";
import { WarmthAvatar } from "@/components/atoms/WarmthAvatar";
import { TopicChip } from "@/components/atoms/TopicChip";
import { InteractionEntry } from "@/components/molecules/InteractionEntry";
import { usePeopleData } from "@/hooks/usePeopleData";
import { useInteractionsData } from "@/hooks/useInteractionsData";
import { useLogInteractionSheetStore } from "@/stores/useLogInteractionSheetStore";
import { daysSince, warmthLevel, warmthLabel } from "@/utils/warmth";

export default function PersonProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contacts, updateContact } = usePeopleData();
  const contact = contacts.find((c) => c.id === id);

  const { interactions, topics, addTopic, toggleTopicDone, removeTopic } =
    useInteractionsData(id ?? "");

  const [newTopicText, setNewTopicText] = useState("");
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  const [mutedColor, primaryForegroundColor] = useCSSVariable([
    "--color-muted",
    "--color-primary-foreground",
  ]);

  if (!id || !contact) return null;

  const days = contact.lastInteractionAt
    ? daysSince(contact.lastInteractionAt)
    : undefined;
  const warmth = warmthLevel(days);
  const statusLabel = warmthLabel(warmth, days);

  const handleAddTopic = async () => {
    const trimmed = newTopicText.trim();
    if (!trimmed) return;
    await addTopic(trimmed);
    setNewTopicText("");
    setIsAddingTopic(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: contact.name }} />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-5 pt-6 pb-40 gap-6"
      >
        {/* Header */}
        <View className="items-center gap-3">
          <WarmthAvatar name={contact.name} warmth={warmth} size="lg" />
          <View className="items-center gap-1">
            <AppText size="2xl" weight="bold" family="headline">
              {contact.name}
            </AppText>
            <AppText size="xs" color="muted">
              {statusLabel}
            </AppText>
          </View>
        </View>

        {/* Talk about next time */}
        <View className="gap-3">
          <AppText
            size="xs"
            weight="medium"
            color="muted"
            className="uppercase tracking-wide"
          >
            Talk About Next Time
          </AppText>
          <View className="flex-row flex-wrap gap-2">
            {topics.map((t) => (
              <TopicChip
                key={t.id}
                topic={t}
                onToggle={() => void toggleTopicDone(t.id, !t.isDone)}
                onRemove={() => void removeTopic(t.id)}
              />
            ))}
            {isAddingTopic ? (
              <View className="flex-row items-center">
                <TextInput
                  value={newTopicText}
                  onChangeText={setNewTopicText}
                  placeholder="Topic…"
                  autoFocus
                  onBlur={() => void handleAddTopic()}
                  onSubmitEditing={() => void handleAddTopic()}
                  returnKeyType="done"
                  className="rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-xs text-foreground"
                  style={{ minWidth: 90 }}
                  placeholderTextColor={mutedColor as string}
                />
              </View>
            ) : (
              <Pressable
                onPress={() => setIsAddingTopic(true)}
                className="flex-row items-center gap-1 rounded-full border border-dashed border-muted/40 px-3 py-1.5"
              >
                <Plus size={10} weight="bold" color={mutedColor as string} />
                <AppText size="xs" color="muted">
                  Add topic
                </AppText>
              </Pressable>
            )}
          </View>
        </View>

        {/* Notes */}
        <View className="gap-3">
          <AppText
            size="xs"
            weight="medium"
            color="muted"
            className="uppercase tracking-wide"
          >
            Notes
          </AppText>
          <TextInput
            defaultValue={contact.notes ?? ""}
            onEndEditing={(e) =>
              void updateContact(id, { notes: e.nativeEvent.text })
            }
            placeholder="Add context about this person — interests, things they mentioned…"
            multiline
            className="rounded-xl bg-surface px-4 py-3 text-sm text-foreground"
            placeholderTextColor={mutedColor as string}
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />
        </View>

        {/* Interaction Timeline */}
        <View className="gap-3">
          <AppText
            size="xs"
            weight="medium"
            color="muted"
            className="uppercase tracking-wide"
          >
            Interactions
          </AppText>
          {interactions.length === 0 ? (
            <AppText size="sm" color="muted">
              No interactions logged yet.
            </AppText>
          ) : (
            <View className="rounded-xl bg-surface px-4">
              {interactions.map((interaction, i) => (
                <View key={interaction.id}>
                  {i > 0 && <View className="h-px bg-default/50" />}
                  <InteractionEntry interaction={interaction} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky log button */}
      <View className="absolute bottom-0 left-0 right-0 bg-background/90 px-5 pb-safe pt-3">
        <Button
          variant="primary"
          onPress={() => useLogInteractionSheetStore.getState().open(id)}
        >
          <View className="flex-row items-center gap-1.5">
            <Plus
              size={16}
              weight="bold"
              color={primaryForegroundColor as string}
            />
            <Button.Label>Log Interaction</Button.Label>
          </View>
        </Button>
      </View>
    </>
  );
}
