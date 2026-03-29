# Migrating from Nativewind to Uniwind

## Key Conceptual Differences

1. **No `tailwind.config.js`**: All theme configuration is now done purely in CSS inside `global.css`.
2. **No `nativewind.d.ts`**: Uniwind auto-generates types.
3. **No Nativewind ThemeProvider**: Remove `NativewindThemeProvider` and JS `vars` logic entirely. (Note: Keep React Navigation's ThemeProvider if used).
4. **No Deduplication**: Uniwind does not deduplicate conflicting classes like `bg-red-500 bg-blue-500`. Use `cn` (`tailwind-merge`) if overriding classes frequently.
5. **Reanimated Required**: For `animated` classes, refer to the animations doc (using Native `react-native-reanimated` instead of CSS transition hacks).
6. **No `cssInterop`**: Replace `cssInterop` calls with `withUniwind(Component)`.

## Migration Steps

### Step 1: Remove Old Setup

- Remove `'nativewind/babel'` from `babel.config.js`.
- Delete `tailwind.config.js`.
- Delete `nativewind.d.ts`.
- Delete the JS file containing the Nativewind `vars()` helper.

### Step 2: Configure Metro for Uniwind

Modify `metro.config.js` to use `withUniwindConfig`:

```js
const { getDefaultConfig } = require("@react-native/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
  // Re-base the default rem to 14px to match Nativewind behavior
  polyfills: { rem: 14 },
});
```

### Step 3: Implement `global.css`

Replace the old Tailwind CSS imports. Start the file explicitly:

```css
@import "tailwindcss";
@import "uniwind";

@layer theme {
  :root {
    @variant light {
      --color-primary: #00a8ff;
    }

    @variant dark {
      --color-primary: #273c75;
    }
  }
}
```

#### Fonts must be single values explicitly

React Native does NOT support fallbacks like `['Roboto-Regular', 'sans-serif']`. Extract them directly:

```css
@theme {
  --font-normal: "Roboto-Regular";
  --font-medium: "Roboto-Medium";
}
```

### Step 4: Refactor `cssInterop`

Swap out interops for the new `withUniwind`.

```tsx
// Before
import { cssInterop } from "nativewind";
import { Button } from "react-native-paper";
cssInterop(Button, { className: "style" });

// After
import { withUniwind } from "uniwind";
import { Button as RNButton } from "react-native-paper";
export const Button = withUniwind(RNButton);
```

### Step 5: Clean Up React App Root

Delete the wrapper `<NativewindThemeProvider>` from `App.tsx` and ensure everything flows naturally from your standard layout tree.

### Step 6: Deal with Safe Area

If you used Nativewind's safe-area injections, wrap your root with `react-native-safe-area-context`'s `SafeAreaListener`:

```tsx
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";

export default function App() {
  return (
    <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
      <YourApp />
    </SafeAreaListener>
  );
}
```
