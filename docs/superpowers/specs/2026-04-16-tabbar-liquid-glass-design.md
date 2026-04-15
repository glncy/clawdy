# Tab Bar: Liquid Glass (iOS) / Custom FAB (Android) Design

**Date:** 2026-04-16
**Branch:** `docs/sprint-design-specs`
**Status:** Approved

---

## Overview

Replace the current single-platform `CustomTabBar` with a platform-split implementation:

- **iOS**: Native `NativeTabs` from `expo-router/unstable-native-tabs` with `systemUltraThinMaterial` blur — renders Apple's liquid glass material automatically on iOS 26+.
- **Android**: Existing `CustomTabBar` component unchanged (floating FAB, Phosphor icons, Tailwind styling).

---

## iOS — NativeTabs (Liquid Glass)

### Tab structure

5 tab triggers in order: **Home · Finance · + · Day · Life**

| Tab | SF Symbol (normal) | SF Symbol (selected) | Navigates |
|---|---|---|---|
| Home | `house` | `house.fill` | `home` screen |
| Finance | `dollarsign.circle` | `dollarsign.circle.fill` | `money` screen |
| + (action) | `plus.circle` | `plus.circle.fill` | — (opens sheet) |
| Day | `sun.max` | `sun.max.fill` | `day` screen |
| Life | `leaf` | `leaf.fill` | `life` screen |

### NativeTabs props

```tsx
<NativeTabs
  blurEffect="systemUltraThinMaterial"
  backgroundColor="transparent"
  minimizeBehavior="onScrollDown"
>
```

- `blurEffect="systemUltraThinMaterial"` — thinnest system material; liquid glass on iOS 26, frosted glass on earlier.
- `backgroundColor="transparent"` — required for the blur to render through.
- `minimizeBehavior="onScrollDown"` — tab bar collapses when user scrolls down (iOS 26+).

### Action tab ("+") — QuickActionSheet trigger

The `+` tab uses `href: null` so Expo Router does not navigate when it is pressed. A `tabPress` event listener on the tab calls `useQuickActionStore.getState().toggle()` to open `QuickActionSheet`.

```tsx
<NativeTabs.Trigger
  name="action"
  href={null}
  options={{
    title: "",
    tabBarIcon: ({ focused }) => ({
      sfSymbol: focused ? "plus.circle.fill" : "plus.circle",
    }),
  }}
  onPress={() => useQuickActionStore.getState().toggle()}
/>
```

A hidden `NativeTabs.Slot` for `"action"` renders nothing (empty screen, never visible).

### Hidden screens

`people`, `settings`, and `more` keep `href: null` — inaccessible from the tab bar, reachable only via `router.push`.

---

## Android — CustomTabBar (unchanged)

The existing `CustomTabBar` component (floating FAB, Phosphor icons, Tailwind) is used on Android without modification.

---

## Layout file (`_layout.tsx`)

```
Platform.OS === "ios"
  → import NativeTabs from "expo-router/unstable-native-tabs"
  → render NativeTabs tree (5 triggers + hidden screens)

Platform.OS !== "ios"
  → import Tabs from "expo-router"
  → render Tabs with tabBar={CustomTabBar} (current implementation)

Both platforms
  → <QuickActionSheet /> and <SettingsSheet /> rendered as siblings (unchanged)
```

---

## Out of Scope

- Animated tab transitions or spring physics on tab switches
- Custom liquid glass tint colors (use system default)
- Badge counts on tab items
- Android material tab bar changes
