---
trigger: always_on
glob: "docs/**/*"
description: Rules for product strategy, documentation, and feature discovery.
---

# Product Strategy & Documentation Rules

These rules govern how we manage the project lifecycle and non-code artifacts.

## 1. Documentation Structure
All strategic work MUST be placed in the root `/docs` folder using the following hierarchy:
- `docs/discovery/`: Brainstorming sessions, raw ideas, and research logs.
- `docs/product/`: PRDs (Product Requirement Documents), user stories, and finalized feature specs.
- `docs/roadmap/`: Phasing, milestones, and high-level project trajectory.
- `docs/planning/`: Technical implementation plans and detailed task breakdowns.
- `docs/architecture/`: ADRs (Architecture Decision Records) and system diagrams.
- `docs/execution/`: Progress logs, implementation notes, and post-mortems.

## 2. Feature Lifecycle
No major feature should be implemented without following this workflow:
1. **Discovery:** Brainstorm ideas in `docs/discovery/`.
2. **Strategy:** Define the "Why" and "What" in a PRD under `docs/product/`.
3. **Phasing:** Update `docs/roadmap/` to reflect where this feature fits.
4. **Planning:** Create an implementation plan in `docs/planning/`.

## 3. Product Ownership
- **Skill Activation:** Always activate the `product-owner` skill when performing tasks related to feature discovery or roadmap management.
- **Decision Logic:** When proposing features, provide options (Lean, Standard, Visionary) to help the user decide on the best path forward.
