# Uniwind & React Native Reanimated

Uniwind Pro natively integrates with `react-native-reanimated` (v4.0.0+) to provide robust, pure Tailwind-class CSS animations and transitions using Native thread performance.

**Note: This requires Reanimated correctly installed.**

## Key Concept: Silent Translation

You do NOT need complex animation logic. Instead of passing `style` hooks `const animatedStyle = useAnimatedStyle(...)`, write utilities.
Uniwind automatically:

1. Detects animation classes (`animate-*` or `transition-*`).
2. Set flags.
3. Swaps the native component for an `Animated.*` equivalent (e.g. `View` -> `Animated.View`).

## Built-In Keyframes

Supports all standard Tailwind animated loops out of the box.

```tsx
// Spins 360 degrees infinitely
<View className="size-32 bg-lime-500 rounded animate-spin" />

// Vertical Bounce
<View className="size-32 bg-blue-500 animate-bounce" />

// Fade In/Out Pulse
<View className="size-32 bg-amber-500 animate-pulse" />

// Scale & Fade Ping
<View className="animate-ping" />
```

## Transitions

Create high-performance interpolations directly on prop changes or state modifications.

```tsx
import { View, Pressable } from 'react-native'

// Interpolating colors when "active:" state evaluates to true
<Pressable
  className="size-32 bg-base active:bg-primary transition-colors duration-500"
/>

// CSS-Driven Dynamic Transitions
<View
  className={`size-32 bg-sky-800 transition-opacity duration-1000 ${
    isVisible ? 'opacity-100' : 'opacity-0'
  }`}
/>

// Transform & Translate
<View
  className={`size-32 transition-transform duration-1000 ${
    isLeft ? '-translate-x-full' : 'translate-x-full'
  }`}
/>

<View
  className={`transition-all duration-1000 ${
    state
      ? 'translate-x-full bg-lime-500 rounded-[64px]'
      : 'translate-x-0 bg-red-500 rounded-none'
  }`}
/>
```

## Supported Utilities

- **Keyframes**: `animate-spin`, `animate-ping`, `animate-pulse`, `animate-bounce`
- **Transition Target**: `transition-all`, `transition-colors`, `transition-opacity`, `transition-transform`
- **Duration**: `duration-75` up to `duration-1000`
- **Delay**: `delay-75` up to `delay-1000`
- **Easing**: `ease-linear`, `ease-in`, `ease-out`, `ease-in-out`
