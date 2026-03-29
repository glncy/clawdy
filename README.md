# Fullstack Boilerplate Monorepo

Reusable starter monorepo for full-stack product development. The repo keeps shared infrastructure, monorepo tooling, CI workflows, and a lightweight app structure that can be adapted into a new product without inheriting old product branding or deployment targets.

## Included Apps
- `apps/mobile`: Expo Router starter app with a minimal native tabs shell.
- `apps/updates-worker`: Cloudflare Worker starter for Expo OTA/update manifests.
- `apps/web`: Next.js app for web surfaces and shared UI experiments.

## Shared Packages
- `packages/eslint-config`: Shared lint configuration.
- `packages/jest-config`: Shared Jest presets and setup.
- `packages/scripts`: Repo automation and workflow helper scripts.
- `packages/tailwind-config`: Shared Tailwind/Uniwind configuration.
- `packages/typescript-config`: Shared TypeScript base configs.
- `packages/ui`: Shared UI primitives for web surfaces.

## Getting Started
```bash
bun install
bun run dev
```

Useful commands:

```bash
bun run test
bun run check-types
bun run build
```

## Notes
- This repository is a boilerplate, not a live product repository.
- Review app identifiers, environment variables, release targets, and deployment settings before using it for a new project.
- `.github/` and `packages/scripts/` are intentionally preserved as reusable infrastructure.
