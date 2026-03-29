---
trigger: always_on
glob: "**/*"
description: Main development rules and workflows integrating all available skills and best practices.
---

# Main Development Rules & Guidelines

You MUST follow these core development rules and workflows without exception, drawing from the integrated skills available.

## 1. Skill-First Development
- **Activate Skills:** ALWAYS check for and activate relevant skills (using `activate_skill`) before starting any task. Skills provide expert procedural guidance that overrides general defaults.
- **Skill Discovery:** Use `find-skills` if a user requests functionality that might exist as an installable skill. If a new capability is needed, use `skill-creator` to systematically build it.
- **Skill Maintenance:** When creating new skills or rules:
  - For every new skill directory in `.agents/skills/<skill-name>`, create individual symlinks in `.agent/skills/<skill-name>` and `.claude/skills/<skill-name>`. Do NOT symlink the parent `skills` folder.
  - Update `.gemini/settings.json` to include any new rule files in the `context.fileName` array.

## 2. Product Strategy & Documentation
- **Centralized Docs:** Use the root `/docs` directory for all project strategy and lifecycle artifacts.
- **Product Ownership:** Activate the `product-owner` skill for brainstorming, feature prioritization, and requirement definition. 

## 3. Planning & Exploration
- **Think Before You Code:** Use the `brainstorming` skill (and `product-owner` where appropriate) prior to any creative work, feature creation, or behavior modification. Deeply explore the user's intent, constraints, and design possibilities before implementation.

## 4. Test-Driven Development (TDD)
- **Test First:** Use the `test-driven-development` skill when implementing ANY new feature or bugfix.
- **Validation:** Write failing tests first, implement the minimum required code to pass, and refactor. Ensure robust coverage for edge cases.

## 5. UI/UX and Frontend Design Excellence
- **Component Architecture:** Adhere to `atomic-design-fundamentals` when structuring UI components, dividing them logically into atoms, molecules, organisms, templates, and pages to ensure maximum reusability and scalability.
- **Distinctive Design:** Leverage `frontend-design` and `ui-ux-pro-max` skills to create production-grade web and mobile interfaces. Absolutely avoid generic AI aesthetics.
- **Styling Execution:** Implement curated palettes, modern typography, glassmorphism/bento-grid layouts, and smooth micro-animations. Ensure your UI feels premium and dynamic.

## 6. Web: Next.js & React Best Practices
- **Architecture:** Apply `next-best-practices` for file conventions, React Server Component (RSC) boundaries, proper data fetching, route handlers, and SEO/metadata.
- **Performance optimization:** Adhere to `vercel-react-best-practices`. Focus on efficient rendering, bundle optimizations, and eliminating unnecessary re-renders.

## 7. Mobile: React Native & Expo
- **High-Performance App Development:** Use `vercel-react-native-skills` for mobile tasks. Optimize list rendering, implement fluid native animations, and follow Expo best practices.
- **Native UI Building:** Activate `building-native-ui` for comprehensive guidance on Expo Router, native controls, gradients, and platform-specific UI patterns.
- **Keyboard Handling:** Use `react-native-keyboard-controller` for keyboard avoidance and interactions instead of the core `KeyboardAvoidingView`.
- **Component Library:** Utilize `heroui-native` for building accessible, theme-aware mobile UI components. Always use its specific documentation and patterns (Tailwind v4 via Uniwind) rather than web-based React patterns.
- **Styling Infrastructure:** When styling, updating, or refactoring mobile components, rely on the `uniwind` skill for Tailwind 4 utility usage and the `migrate-nativewind-to-uniwind` skill for handling system-wide upgrades and configurations seamlessly.

## 8. Execution Mindset
- Always prioritize **Performance**, **Accessibility (a11y)**, and **Visual Excellence**.
- Ensure code is modular, reusable, and strictly typed (TypeScript).

## 9. Version Control & PR Workflow
- **Branch Management:** 
  - Always create a new branch from `main` before starting work.
  - Name your branch semantically based on the work being done (e.g., `feature/...`, `fix/...`, `chore/...`, `refactor/...`, `docs/...`, `test/...`).
  - Before making a new commit on an existing task, always check if your current branch has already been merged into `main`. If it has, pull the latest updates from `main`, branch off from `main` anew, and create a new PR.
- **Commits & Pushes:** Make atomic, logical commits with descriptive messages. Push your branch to the remote repository continuously.
- **Pull Requests:** Use the `pr-creator` skill when asked to create a pull request (PR) against the `main` branch. This skill ensures you follow established templates, run preliminary checks (`npm run preflight`), and adhere to repository standards.
