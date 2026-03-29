# Uniwind Components & Hooks API

## Built-In Components

Uniwind automatically binds to most standard React Native components. These components do NOT need `withUniwind` wrappers:

- `View`, `Text`, `TextInput`, `Pressable`, `TouchableOpacity`, `TouchableHighlight`, `Image`
- `ScrollView`, `FlatList`, `SectionList`, `KeyboardAvoidingView`
- `SafeAreaView`, `Switch`, `Modal`, `ActivityIndicator`

## Hooks

### `useCSSVariable(name | name[])`

Resolves CSS Variables to their runtime string values (e.g. Hex or HSL). Changes automatically trigger a component re-render when themes shift.

```tsx
// Single Variable
const primaryColor = useCSSVariable("--color-primary");

// Multiple Variables
const [surfaceColor, borderColor] = useCSSVariable([
  "--color-surface",
  "--color-border",
]);

<View style={{ backgroundColor: surfaceColor, borderColor, borderWidth: 1 }} />;
```

### `useResolveClassNames(className)`

Converts Tailwind strings to runtime React Native style objects. Extremely useful for library contexts that accept a `style` or `contentContainerStyle` block rather than `className`.

```tsx
const contentContainerStyle = useResolveClassNames("pb-safe px-4 bg-muted");
<FlashList contentContainerStyle={contentContainerStyle} />;
```

### `useUniwind()`

Accesses current theme environment metadata.

```tsx
const { theme } = useUniwind();
// 'light' | 'dark' | 'system'
```

## `withUniwind(Component, mappings?)`

Wraps third-party components (e.g., UI libraries or custom packages) so they natively understand Tailwind `className` injections.

### 1. Basic Wrap (Replaces `cssInterop`)

```tsx
import { withUniwind } from "uniwind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

export const SafeAreaView = withUniwind(RNSafeAreaView);
```

### 2. Custom Prop Mapping

To map generated Tailwind rules cleanly into library-specific non-style props (like `size={24}` or `fill="#fff"`):

```tsx
const StyledAvatar = withUniwind(Avatar, {
  size: {
    fromClassName: "sizeClassName", // You write <StyledAvatar sizeClassName="w-12"/>
    styleProperty: "width", // Uniwind extracts the numeric value '48' from 'w-12' and passes it to the `size` prop.
  },
});
```

#### Detailed Example: Coloring SVGs

SVGs often accept `stroke` and `fill` colors as raw strings.

```tsx
export const StyledPath = withUniwind(Path, {
  stroke: {
    fromClassName: "strokeClassName",
    styleProperty: "accentColor",
  },
  fill: {
    fromClassName: "fillClassName",
    styleProperty: "accentColor",
  },
});

<StyledPath
  strokeClassName="accent-blue-500" // Maps the color hex to standard SVG "stroke" prop
  fillClassName="accent-transparent"
  d="..."
/>;
```

#### Mapping Entire Style Blocks

```tsx
export const StyledLibrary = withUniwind(LibraryComponent, {
  containerStyle: {
    fromClassName: "containerClassName", // No styleProperty provided; maps full object
  },
});
```
