# Uniwind Platform, Data & Responsive Selectors

Uniwind introduces specific modifiers (selectors) that run natively on React Native without creating Javascript runtime bloat.

## Platform Selectors

Target specific OS without using `Platform.select()` logically.

- `ios:*`
- `android:*`
- `web:*`
- `native:*` (Both iOS & Android, excludes Web)

```tsx
// Platform specific heights and padding
<View className="ios:pb-4 android:pb-2 web:py-6 native:bg-emerald-500" />

// Platform specific colors for OS conventions
<Text className="android:text-teal-600 ios:text-blue-500">Settings</Text>
```

You can also use CSS `@media` in `global.css` if necessary:

```css
@media (os: ios) {
  --color-primary: #007aff;
}
```

## Responsive Breakpoints

Uniwind perfectly mimics Tailwind CSS **Mobile-first** design. Ensure you do not style desktop-first!
The un-prefixed class applies to all screen sizes until overridden by a larger screen breakpoint.

- `sm:` (640px)
- `md:` (768px)
- `lg:` (1024px)
- `xl:` (1280px)

```tsx
// Mobile first approach: By default w-full, from md: w-1/2, from lg: w-1/3
<View className="w-full md:w-1/2 lg:w-1/3" />
```

## Data Selectors (`data-[prop=value]:...`)

Conditionally style your component directly from its `data-*` props without messy template strings.

### Rules & Capabilities:

- The syntax is `data-[prop=value]:utility`. The `prop` name does not include the prefix `data-` inside the brackets.
- Supports equality checks and boolean checks (matches string or boolean types).
- Resolves at runtime. Uniwind evaluates component props vs data constraints.

### Usage:

```tsx
// Boolean Props
<View
  data-selected={isSelected} // matches data-[selected=true] or data-[selected=false]
  className="border px-3 py-2 data-[selected=true]:ring-2 data-[selected=true]:ring-blue-500"
/>

// String Props
<View
  data-state={isOpen ? 'open' : 'closed'}
  className="data-[state=open]:bg-slate-500/50 data-[state=closed]:bg-transparent"
/>

// Combined Variants
<Pressable
  data-status="success"
  data-size="sm"
  className="
    data-[status=success]:bg-green-500 data-[status=success]:text-white
    data-[size=sm]:px-2 data-[size=sm]:py-0.5
  "
/>
```

## Safe Area Features (Open Source Version)

Built-in classes for safe area insets logic:

- Extends padding/margins with insets: `p-safe`, `pt-safe`, `px-safe`.
- Or conditions logic: `pt-safe-or-4` (takes inset or 16px, whichever is larger).
- Offset logic: `pt-safe-offset-2` (inset + 8px).

_Requires `react-native-safe-area-context` to stream insets via `SafeAreaListener` to `Uniwind.updateInsets` unless using the Pro C++ injecting version._
