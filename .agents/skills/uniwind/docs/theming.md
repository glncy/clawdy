# Uniwind Theming Guide

Uniwind natively supports CSS variables and true CSS-based theming tailored for React Native.

## `global.css` & CSS Variables

Uniwind moves theme configuration entirely into CSS, replacing the need for a `tailwind.config.js` theme block.
Semantic variables should be declared inside `@theme` blocks or `:root`.

```css
@import "tailwindcss";
@import "uniwind";

@theme {
  /* Using standard hex */
  --color-brand: #00a8ff;
  --font-sans: "Inter-Regular";

  /* 
   * CAUTION: For HSL variables, wrap them in hsl() in the @theme block 
   * if you are interpolating inside tailwind classNames.
   */
  --color-primary: hsl(var(--primary));
}

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: 240 10% 4%;
    --foreground: 0 0% 100%;
  }
}
```

## CSS Functions

Uniwind provides device-specific CSS functions that adapt dynamically:

- `hairlineWidth()`: Thinnest displayable line. Use in `@utility` to map to Tailwind.
- `fontScale(scale)`: Adapts to accessibility font settings.
- `pixelRatio(scale)`: Scales by device density.
- `light-dark(lightColor, darkColor)`: Directly switch colors depending on the Active Theme.

### `light-dark()` Example

```css
@utility bg-adaptive {
  background-color: light-dark(#ffffff, #1f2937);
}
```

`<View className="bg-adaptive" />` will react instantly to the theme switch without any JS logic.

## Programmatic Updates & Theme Application

### `Uniwind.setTheme(themeName)`

Imperatively change the app theme. Valid values: `'light'`, `'dark'`, `'system'`, or custom variants registered in `metro.config.js`.

### `Uniwind.updateCSSVariables(themeName, variables)`

Update CSS variables at runtime (e.g., user-customizable color palettes).

```ts
Uniwind.updateCSSVariables("light", {
  "--color-primary": userSelectedHex,
});
```

### Advanced: Custom Themes (@variant)

Define custom variants in `global.css` and register them in `metro.config.js` (`extraThemes: ['ocean']`).

```css
@layer theme {
  :root {
    @variant ocean {
      --color-background: #0c4a6e;
      --color-foreground: #e0f2fe;
    }
  }
}
```

_Note: Ensure ALL theme variants define the exact same set of variables to avoid runtime crashes (`TypeError: Cannot convert undefined value to object`)._
