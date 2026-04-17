import * as Contacts from "expo-contacts";

export interface ImportedContact {
  name: string;
  phone?: string;
  deviceContactId?: string;
}

/**
 * Presents the native contact picker and returns a minimal contact shape
 * suitable for inserting into our local contacts store.
 *
 * Returns null when the user cancels the picker, denies permission,
 * or the platform does not support it.
 */
export async function importDeviceContact(): Promise<ImportedContact | null> {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status !== "granted") return null;

  const contact = await Contacts.presentContactPickerAsync();
  if (!contact) return null;

  const joinedName = [contact.firstName, contact.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const name = contact.name?.trim() || joinedName || "Unnamed";
  const phone = contact.phoneNumbers?.[0]?.number?.trim();

  return {
    name,
    phone: phone || undefined,
    deviceContactId: contact.id,
  };
}
