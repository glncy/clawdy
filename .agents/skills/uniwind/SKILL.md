---
name: uniwind
description: >
  High-performance Tailwind CSS v4 engine for React Native. Use for styling React Native 
  apps with Tailwind utility classes, CSS variables, and native-first features like 
  platform selectors, responsive breakpoints, data selectors, and custom themes.
---

# Uniwind Skill Overview

Uniwind is a native-first CSS engine that brings **Tailwind CSS v4** to React Native. It uses a custom CSS parser to enable true CSS-based theming, platform-specific styling, and high-performance rendering.

This project heavily relies on Uniwind over previous tooling (like Nativewind).

**If you are attempting complex features with Uniwind (like animations, new themes, or refactoring), YOU ABSOLUTELY MUST read the accompanying context files.**

## Deep-Dive Context Files

To prevent incorrect code generation (such as using web-specific `@apply` blocks badly, using `Platform.select()` instead of native selectors, or migrating improperly), please run `view_file` on the following documents depending on your task:

1. **[Theming & CSS Setup](.agents/skills/uniwind/docs/theming.md)**

   > Read this when: Setting up Global CSS, changing Color Tokens, defining new themes, using `light-dark()`, or manipulating `Uniwind.updateCSSVariables()`.

2. **[Selectors (Platform, Data, Responsive)](.agents/skills/uniwind/docs/selectors.md)**

   > Read this when: Making Platform-specific adjustments (`ios:`, `android:`), building React state-driven styles (`data-[state=open]:`), or making the app Responsive (`md:`).

3. **[Components & Hooks](.agents/skills/uniwind/docs/components-and-hooks.md)**

   > Read this when: Dealing with libraries that don't support `className` natively. This covers how to wrap components with `withUniwind` to map Tailwinds into props like `size={48}`. It also explains `useCSSVariable()` and `useResolveClassNames()`.

4. **[Reanimated Animations](.agents/skills/uniwind/docs/animations.md)**

   > Read this when: Building keyframe animations (`animate-spin`) or transitions (`transition-colors`). Note that Uniwind implements pure Tailwind keys translated silently to Reanimated.

5. **[Migrating from Nativewind](.agents/skills/uniwind/docs/migration-from-nativewind.md)**
   > Read this when: Refactoring older `nativewind` implementations, fixing broken `<ThemeProvider>` contexts, removing `tailwind.config.js`, or migrating `cssInterop`.

## Quick Start (Metro Config)

If simply verifying setup:
Uniwind must be the **outermost wrapper** in `metro.config.js`.

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  cssEntryFile: "./global.css",
  polyfills: { rem: 14 },
});
```

Always use `./global.css`. Note that it must be flat to determine correctly the app project root. `package.json` imports outside this root will fail without `@source` tags pointing to their directories.
