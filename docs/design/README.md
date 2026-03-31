# clawdi Design Reference

## Structure

```
design/
├── final-reference/   # Implementation targets — build these
├── pegs/              # Inspiration & mood references
└── README.md
```

## Final Reference Screens

These are the screens to implement for Phase 1.

Generated via [Stitch](https://stitch.withgoogle.com/) across two projects:
- **Mobile mode project** (ID: `238989896427880178`) — primary screens
- **Web mode project** (ID: `2633854475307476228`) — used for higher-fidelity input modal

| File | Screen | Mode | Source | Description |
|------|--------|------|--------|-------------|
| `home-light-green.png` | Home | Light | Stitch Mobile | Healthy state — $1,247.50 Safe to Spend, green accents, bill cards with "you have 3x ready" context |
| `home-light-red.png` | Home | Light | Stitch Mobile | Tight state — $42.30 Safe to Spend, red accents, "not enough" / "barely covered" bill warnings |
| `history-light.png` | History | Light | Stitch Mobile | Transaction list with segmented tabs (Transactions/Recurring), grouped by date, multi-currency ($, ₱) |
| `history-dark.png` | History | Dark | Stitch Mobile | Same layout, dark elevated cards, timestamps on each entry |
| `settings-light.png` | Settings | Light | Stitch Mobile | Premium trial, Local AI status, notification toggles, export/delete, View Source Code |
| `settings-dark.png` | Settings | Dark | Stitch Mobile | Same sections, dark elevated cards, green accent toggles |
| `input-light.png` | Input Modal | Light | Stitch Mobile | Bottom sheet with text + voice input, AI confirmation pill chips, "Save Transaction" CTA |
| `input-light-v2.png` | Input Modal | Light | Stitch Web | Cleanest version — proper blurred background, correct layout, no hallucinated names |

## Pegs

Inspiration screens — not exact implementation targets but useful for dark mode direction and presentation mockups.

| File | Source | Notes |
|------|--------|-------|
| `home-dark-green.png` | Stitch Mobile | Good dark mode feel, has extra elements (chart, stats tab) not in spec |
| `home-dark-green-web.png` | Stitch Web | Dark mode with "Smart Analysis" card idea, clean layout |
| `home-light-green-web.png` | Stitch Web | Phone bezel frame mockup, nice for presentations |
| `home-light-red-web.png` | Stitch Web | Red state with phone frame, "Weekly Velocity" card idea |
| `input-dark.png` | Stitch Mobile | Dark bottom sheet reference, older "Add expense" pill layout |
| `settings-light-web.png` | Stitch Web | Settings with phone frame, slightly different section labels |

## Design System

| Token | Value |
|-------|-------|
| **Primary** | `#4ADE80` (green) |
| **Warning** | `#FBBF24` (amber) |
| **Danger** | `#F87171` (red) |
| **Headline Font** | Sora |
| **Body Font** | Plus Jakarta Sans |
| **Corner Radius** | 12px |
| **Color Mode** | Light (default) + Dark |

## Color-as-Data System

The home screen background and accents shift based on Safe to Spend health:

| State | Color | Meaning |
|-------|-------|---------|
| Healthy | Green `#4ADE80` | Budget is comfortable |
| Caution | Amber `#FBBF24` | Approaching spending limit |
| Tight | Red `#F87171` | Near or over budget |

## Tab Bar

4-item bottom tab bar with prominent center add button:

```
[Home]  [History]  [+ ADD (raised, green)]  [Settings]
```

The center "+" is a raised circular button (~56px), extends above the tab bar, and is the primary call-to-action on every screen (except Settings).

## Key Design Principles

1. **Hyper-minimalist** — if a kid and a grandparent can't use it without a tutorial, simplify further
2. **One thumb rule** — every daily action reachable with one thumb
3. **Color communicates** — background color tells you your financial health at a glance
4. **No onboarding** — the UI must be self-explanatory
5. **No charts/graphs** — just numbers, colors, and lists
6. **Accessibility** — minimum 44x44pt touch targets, high contrast text
