import { View } from "react-native";
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";
import { Stack, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  Label,
  TextField,
  FieldError,
  Chip,
} from "heroui-native";
import { AppText } from "@/components/atoms/Text";
import { usePeopleData } from "@/hooks/usePeopleData";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NUDGE_OPTIONS = [
  { label: "Weekly", value: 7 },
  { label: "Every 2 weeks", value: 14 },
  { label: "Monthly", value: 30 },
  { label: "Never", value: 0 },
] as const;

const personSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().optional().or(z.literal("")),
  nudgeFrequencyDays: z.number().int().nonnegative(),
});

type PersonForm = z.infer<typeof personSchema>;

export default function AddPersonScreen() {
  const { addContact } = usePeopleData();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PersonForm>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: "",
      phone: "",
      nudgeFrequencyDays: 14,
    },
  });

  const selectedNudge = watch("nudgeFrequencyDays");

  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    router.back();
  };

  const onSubmit = async (values: PersonForm) => {
    const trimmedPhone = values.phone?.trim();
    await addContact({
      name: values.name.trim(),
      phone: trimmedPhone ? trimmedPhone : undefined,
      nudgeFrequencyDays: values.nudgeFrequencyDays,
      source: "manual",
    });
    handleClose();
  };

  return (
    <>
      <Stack.Screen options={{ title: "Add Person" }} />
      <KeyboardAwareScrollView
        bottomOffset={headerHeight + insets.bottom + 80}
        className="flex-1"
        contentContainerClassName="px-5 py-6 gap-4 pb-safe"
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        <AppText size="sm" color="muted">
          Start with the basics — you can add birthdays, notes, and topics
          later on their profile.
        </AppText>

        <TextField isInvalid={!!errors.name}>
          <Label>Name</Label>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                placeholder="Maria Santos"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                autoFocus
              />
            )}
          />
          <FieldError>{errors.name?.message}</FieldError>
        </TextField>

        <TextField>
          <Label>Phone (optional)</Label>
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                placeholder="555-0100"
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
              />
            )}
          />
        </TextField>

        <View className="gap-1">
          <AppText size="xs" color="muted">
            Nudge frequency
          </AppText>
          <View className="flex-row flex-wrap gap-2">
            {NUDGE_OPTIONS.map((opt) => {
              const selected = selectedNudge === opt.value;
              return (
                <Chip
                  key={opt.value}
                  variant={selected ? "primary" : "secondary"}
                  color={selected ? "accent" : "default"}
                  onPress={() => setValue("nudgeFrequencyDays", opt.value)}
                >
                  <Chip.Label>{opt.label}</Chip.Label>
                </Chip>
              );
            })}
          </View>
          <AppText size="xs" color="muted" className="mt-1">
            We&apos;ll gently remind you to reconnect at this cadence.
          </AppText>
        </View>
      </KeyboardAwareScrollView>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={headerHeight + insets.bottom + 48}
        className="px-5 flex-row gap-3 mb-safe absolute bottom-0"
      >
        <Button variant="tertiary" className="flex-1" onPress={handleClose}>
          <Button.Label>Cancel</Button.Label>
        </Button>
        <Button
          className="flex-1"
          onPress={handleSubmit(onSubmit)}
          isDisabled={isSubmitting}
        >
          <Button.Label>Save Person</Button.Label>
        </Button>
      </KeyboardAvoidingView>
    </>
  );
}
