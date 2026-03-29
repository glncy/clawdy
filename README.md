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

## How To Use This Boilerplate

1. Clone the boilerplate repository.

   ```bash
   git clone https://github.com/glncy/fullstack-boilerplate-monorepo.git your-app-name
   cd your-app-name
   ```

2. Point the local checkout at your own repository.
   Create a new GitHub repository for your product, then replace `origin` so future pushes go to your app repo instead of the boilerplate source repo.

   ```bash
   git remote rename origin upstream
   git remote add origin https://github.com/<your-org>/<your-repo>.git
   ```

3. Install dependencies and verify the starter boots.

   ```bash
   bun install
   bun run dev
   ```


## Deployment Environment Variables

Set these before deploying or enabling the reusable workflows in this repo.

### Mobile
- `apps/mobile/app.json` currently points OTA updates at `https://example.com/api/ota/fullstack-boilerplate/manifest`.
- Replace that URL with your real updates worker domain and project slug before shipping OTA updates.
- GitHub mobile workflows write an app `.env` file from the GitHub Environment variable `ENV_FILE`.

### Web
- `apps/web/.dev.vars` currently defines `NEXTJS_ENV=development` for local Cloudflare/OpenNext work.
- Add any real production runtime values through your Cloudflare environment configuration before deployment.

### Updates Worker
- `GITHUB_AUTH_TOKEN`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `CODESIGNING_APP_PRIVATE_KEY` optional
- `CODESIGNING_APP_KEY_ID` optional

The updates worker also needs its project mapping in `apps/updates-worker/src/index.ts` updated to your real GitHub owner, OTA repo, and app slug.

### GitHub Actions
- `ENV_FILE` GitHub Environment variable for mobile app builds/releases
- `EXPO_UP_GITHUB_TOKEN` GitHub secret for `expo-up` release, history, and rollback workflows

## Upstream Sync

### Boilerplate Upstream Sync

This repo can track the separate boilerplate repo as an upstream source:

- `https://github.com/glncy/fullstack-boilerplate-monorepo`

### Add the upstream remote

```bash
git remote add upstream https://github.com/glncy/fullstack-boilerplate-monorepo.git
```

### Upstream Syncs

After the upstream relationship is set up, create a branch and open a PR for each upstream sync:

```bash
git checkout -b chore/upstream-sync
git fetch upstream
git merge upstream/main
```

Use a branch and PR for each sync so upstream changes are reviewed before landing on `main`.

## Notes
- This repository is a boilerplate, not a live product repository.
- Review app identifiers, environment variables, release targets, and deployment settings before using it for a new project.
- `.github/` and `packages/scripts/` are intentionally preserved as reusable infrastructure.
