# People Tab — Design Spec

## Goal

Build the People tab as a fully visible, AI-powered relationship companion. Users manage the people they care about, log interactions, track life events, and receive local AI nudges to stay meaningfully connected — all stored locally, no cloud sync.

---

## Tab Bar Changes (prerequisite)

### iOS 26+ (NativeTabs)
Add `people` as the 5th visible `NativeTabs.Trigger` in `_layout.tsx`:
```tsx
<NativeTabs.Trigger name="people">
  <NativeTabs.Trigger.Label>People</NativeTabs.Trigger.Label>
  <NativeTabs.Trigger.Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
</NativeTabs.Trigger>
```
FAB remains center glass pill (already built). Order: Home · Finance · Day · Life · People.

### iOS <26 / Android (CustomTabBar)
Refactor `CustomTabBar.tsx`:
- Remove center-raised FAB from tab bar layout
- Render 5 equal tab items: Home, Finance, Day, Life, People
- Add a floating FAB button positioned `bottom-right` above the tab bar (mirrors the iOS 26+ glass FAB pattern, using `BlurView` with `systemUltraThinMaterial` tint on iOS, solid primary-color circle on Android)
- FAB must NOT overlap any tab bar item — offset `right: 16`, `bottom: tabBarHeight + 16`

`TAB_CONFIG` additions:
```ts
people: { label: "People", icon: UsersThree }, // phosphor-react-native
```
`LEFT_TABS = ["home", "money"]`, `RIGHT_TABS = ["day", "life", "people"]` — drop the separate FAB slot. (Route name is `money`, label is "Finance" — matching existing convention.)

---

## Screen 1: People Dashboard (`/people/index.tsx`)

### Layout (top → bottom, ScrollView)
1. **Header** — "People" title (headline font, 2xl bold) + search icon + "+ Add" button (opens AddPersonSheet)
2. **AI Daily Pick card** — who to reach out to today (see AI section)
3. **Nudge + Birthday row** — side-by-side mini-cards (HStack, each `flex-1`)
   - Nudge card: contact name, days since last talk, "say hi?" CTA
   - Birthday card: contact name, days until birthday, gift idea indicator
   - Both cards hidden when no data
4. **Contact list** — sorted by warmth (most recent first), section label "ALL PEOPLE"
   - Each row: avatar (initials circle, color-coded by warmth), name, last interaction type + date, warmth left-border accent, chevron
   - Warmth colors: green (`--color-primary`) ≤7 days, yellow (`--color-warning`) 8–21 days, grey (`--color-muted`) 22+ days

### Empty state
Full-screen illustration + "Add the people who matter" + "+ Add your first person" button.

---

## Screen 2: Person Profile (`/people/[id].tsx`)

### Layout (top → bottom, ScrollView)

**Section 1 — Header**
- Avatar: initials circle, color derived from warmth
- Name, warmth status label ("● Warm · 2 days ago" / "● Cooling · 12 days ago" / "● Distant · 30 days ago")
- Edit button (top-right)

**Section 2 — AI Insight card** *(shown when ≥2 interactions logged)*
- Single sentence from local AI about relationship health
- e.g. "You and Maria have connected 3 times this month. She mentioned moving — good time to follow up."

**Section 3 — "Talk about next time"**
- Pinned topic chips (tappable to mark done)
- "+ Add topic" inline at end

**Section 4 — Notes**
- Free-text field (multiline, editable inline)
- Placeholder: "Add context about this person — interests, things they mentioned, anything worth remembering"

**Section 5 — Interaction Timeline**
- Chronological list of logged interactions (newest first)
- Each entry: date, type icon (☕ coffee / 📞 call / 💬 text / 🎤 voice note / 👋 other), optional note snippet
- "AI summary" badge on entries that were auto-summarized
- "+ Log interaction" sticky button at bottom of screen (also accessible from QuickActionSheet "Log a chat")

**Section 6 — Life Events**
- Birthday + anniversary cards with countdown
- AI-drafted birthday message button (appears 3 days before)
- Gift tracker: gifts given list + "+ Add gift idea" + AI suggestions button

**Section 7 — Relationship Rewind** *(shown when ≥1 year of data)*
- "This time last year…" contextual comparison card

**Section 8 — Pre-meet Briefing**
- "Meeting today" button → modal with last chat summary, pinned topics, notes snapshot

---

## Add Person Sheet (`AddPersonSheet`)

Two entry modes (segmented control at top):

**Manual:**
- Name (required)
- Phone (optional)
- Birthday (optional, date picker)
- Anniversary (optional, date picker)
- Nudge frequency (dropdown: Every week / Every 2 weeks / Monthly / Never)

**Import from device:**
- Request `expo-contacts` permission
- Search/scroll device contacts list
- Select → pre-fills name, phone, birthday if available
- User confirms before saving

---

## Log Interaction Sheet (`LogInteractionSheet`)

Triggered from: QuickActionSheet "Log a chat" → person picker → this sheet, OR "+ Log interaction" on Person Profile.

Fields:
- Person picker (pre-filled if opened from profile)
- Interaction type: Call / Coffee / Text / Voice note / Other (segmented)
- Date (defaults to today)
- Note (optional free text)

On save:
- Creates `interactions` row
- Triggers AI chat summarizer in background (updates `interactions.ai_summary`)
- Auto-suggests "talk about next time" topics if AI finds any

---

## Database Schema (Drizzle + expo-sqlite)

```ts
// contacts
export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  notes: text("notes"),
  nudgeFrequencyDays: integer("nudge_frequency_days").default(14),
  source: text("source", { enum: ["manual", "device"] }).default("manual"),
  deviceContactId: text("device_contact_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// interactions
export const interactions = sqliteTable("interactions", {
  id: text("id").primaryKey(),
  contactId: text("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["call", "coffee", "text", "voicenote", "other"] }).notNull(),
  note: text("note"),
  aiSummary: text("ai_summary"),
  occurredAt: integer("occurred_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// next_topics
export const nextTopics = sqliteTable("next_topics", {
  id: text("id").primaryKey(),
  contactId: text("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  isDone: integer("is_done", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// special_dates
export const specialDates = sqliteTable("special_dates", {
  id: text("id").primaryKey(),
  contactId: text("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["birthday", "anniversary", "other"] }).notNull(),
  label: text("label"),
  month: integer("month").notNull(),
  day: integer("day").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// gifts
export const gifts = sqliteTable("gifts", {
  id: text("id").primaryKey(),
  contactId: text("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  specialDateId: text("special_date_id").references(() => specialDates.id),
  name: text("name").notNull(),
  isAiSuggested: integer("is_ai_suggested", { mode: "boolean" }).default(false),
  givenAt: integer("given_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
```

---

## AI Features (local Qwen 2.5 1.5B, Vercel AI SDK)

All AI runs on-device. Graceful fallback to rule-based logic when model unavailable.

| Feature | Trigger | Input | Output |
|---|---|---|---|
| **Daily pick** | App open (morning) | All contacts + last interaction dates + today's mood | One contact recommendation + reason sentence |
| **Chat summarizer** | After logging interaction with note | Interaction note + contact's notes + previous topics | 1–2 sentence summary, suggested next-topics |
| **Birthday message draft** | 3 days before birthday | Contact name + notes + interaction history | Draft message string |
| **Gift suggestions** | User taps "AI Ideas" on gift section | Contact notes + past gifts | 3–5 gift idea strings |
| **Smart nudge timing** | Daily background task | User's past interaction timestamps by hour/day | Optimal notification time slot |
| **Pre-meet briefing** | User taps "Meeting today" | Last interaction summary + next topics + notes | Structured brief (3–5 bullet points) |
| **Monthly social recap** | End of month | All interactions for month + mood data | Narrative recap paragraph |
| **Relationship health** | Profile screen load | All interactions (90 days) + next topics + upcoming dates | One non-judgmental insight sentence |
| **Cross-pillar insight** | Home screen / People main | Mood logs + social interaction timestamps | Pattern sentence ("when you catch up with friends, your mood…") |

---

## Component Architecture

```
organisms/
  PeopleDashboard/         — main screen composition
  PersonProfile/           — full profile screen
  AddPersonSheet/          — manual + device import sheet
  LogInteractionSheet/     — log a chat/call/coffee

molecules/
  ContactRow/              — warmth-colored list item
  DailyPickCard/           — AI "reach out today" card
  NudgeCard/               — reconnect prompt (update existing)
  BirthdayCard/            — countdown + gift indicator
  InteractionEntry/        — timeline row
  RelationshipInsightCard/ — AI health sentence card
  PreMeetBriefModal/       — meeting briefing overlay
  RewindCard/              — "this time last year" comparison

atoms/
  WarmthAvatar/            — initials circle + warmth ring color
  TopicChip/               — "talk about next time" pin
```

---

## Navigation

- `/(main)/(tabs)/people/index.tsx` — dashboard (now visible in tab bar)
- `/(main)/(tabs)/people/[id].tsx` — person profile (push navigation)
- `/(main)/(tabs)/people/_layout.tsx` — Stack with transparent header + gear button

QuickActionSheet "Log a chat" → opens `LogInteractionSheet` → person picker → on save, navigates to that person's profile.

---

## Out of Scope (this spec)

- Social graph / mutual connections
- Sharing or exporting relationship data
- Push notifications (nudge delivery — timing logic only, notification scheduling is a separate feature)
- iCloud or any cloud backup of contact data
