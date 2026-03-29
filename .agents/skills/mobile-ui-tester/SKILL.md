---
name: mobile-ui-tester
description: "Expert process for visual testing and auditing of React Native and Expo mobile applications using screenshots and element hierarchy inspection."
---

# Mobile UI Tester Skill

Expert process for visual testing and auditing of React Native / Expo mobile applications using screenshots and element hierarchy inspection.

## Instructions

### 1. Device Discovery
Before testing, always list available devices to find a target simulator or physical device.
- Use `mobile_list_available_devices`
- Ask the user to select if multiple devices are available.

### 2. App Launch & Navigation
- Find the package name (Android) or bundle identifier (iOS) in `app.json` or `package.json`.
- Use `mobile_launch_app` to start the app.
- Use `mobile_click_on_screen_at_coordinates` or `mobile_type_keys` to navigate through flows (e.g., onboarding).

### 3. Visual Audit
- Use `mobile_take_screenshot` to capture the current state.
- **Audit Criteria:**
    - Alignment: Are elements centered/distributed correctly?
    - Theming: Does it match the "Electric Play" (Neon/Glass) palette?
    - Content: No text cut-offs or overlapping elements.
    - Touch Targets: Ensure interactive elements are accessible.

### 4. Interactive Testing
- Use `mobile_list_elements_on_screen` to verify the view hierarchy and accessibility labels.
- Confirm state changes (e.g., button disable/enable) after interaction.

## Available Resources
- `references/api_reference.md`: Tool-specific guidance for mobile MCP.
