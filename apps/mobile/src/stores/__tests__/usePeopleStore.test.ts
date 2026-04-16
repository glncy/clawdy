import { usePeopleStore } from "../usePeopleStore";
import type { Database } from "../../db/client";
import type { Contact } from "@/types";

type Row = Record<string, unknown>;

function makeFakeDb(): { db: Database; rows: Row[] } {
  const rows: Row[] = [];

  const api = {
    insert: () => ({
      values: async (v: Row) => {
        rows.push({ ...v });
      },
    }),
    update: () => ({
      set: (patch: Row) => ({
        where: async () => {
          if (rows[0]) Object.assign(rows[0], patch);
        },
      }),
    }),
    delete: () => ({
      where: async () => {
        rows.length = 0;
      },
    }),
    select: () => ({
      from: async () => [...rows],
    }),
  };

  return { db: api as unknown as Database, rows };
}

function reset() {
  usePeopleStore.setState({ contacts: [], isLoaded: false });
}

describe("usePeopleStore", () => {
  beforeEach(reset);

  it("addContact inserts row and appends to state", async () => {
    const { db, rows } = makeFakeDb();

    const contact = await usePeopleStore.getState().addContact(db, {
      name: "Maria",
      phone: "555-1000",
      nudgeFrequencyDays: 14,
      source: "manual",
    });

    expect(contact!.id).toBeTruthy();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: "Maria", phone: "555-1000" });

    const state = usePeopleStore.getState().contacts;
    expect(state).toHaveLength(1);
    expect(state[0]).toMatchObject<Partial<Contact>>({
      name: "Maria",
      nudgeFrequencyDays: 14,
    });
  });

  it("updateContact merges fields by id", async () => {
    const { db } = makeFakeDb();
    const c = await usePeopleStore.getState().addContact(db, {
      name: "Maria",
      nudgeFrequencyDays: 14,
      source: "manual",
    });

    await usePeopleStore
      .getState()
      .updateContact(db, c!.id, { notes: "loves jazz" });

    const updated = usePeopleStore.getState().contacts[0]!;
    expect(updated.notes).toBe("loves jazz");
    expect(updated.name).toBe("Maria");
  });

  it("removeContact deletes by id from state", async () => {
    const { db } = makeFakeDb();
    const c = await usePeopleStore.getState().addContact(db, {
      name: "Maria",
      nudgeFrequencyDays: 14,
      source: "manual",
    });

    await usePeopleStore.getState().removeContact(db, c!.id);
    expect(usePeopleStore.getState().contacts).toHaveLength(0);
  });

  it("getContactById returns undefined for unknown id", () => {
    const found = usePeopleStore.getState().getContactById("missing");
    expect(found).toBeUndefined();
  });

  it("patchContactMeta updates derived fields in-memory only", async () => {
    const { db } = makeFakeDb();
    const c = await usePeopleStore.getState().addContact(db, {
      name: "Maria",
      nudgeFrequencyDays: 14,
      source: "manual",
    });

    usePeopleStore.getState().patchContactMeta(c!.id, {
      lastInteractionAt: "2026-04-16T10:00:00.000Z",
      lastInteractionType: "call",
    });

    const updated = usePeopleStore.getState().contacts[0]!;
    expect(updated.lastInteractionAt).toBe("2026-04-16T10:00:00.000Z");
    expect(updated.lastInteractionType).toBe("call");
    expect(updated.name).toBe("Maria"); // unchanged
  });
});
