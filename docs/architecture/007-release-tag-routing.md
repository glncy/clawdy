# Release Tag Routing

This document explains how published GitHub release tags are routed to production workflows.

## Accepted tag formats

The release router accepts two tag shapes:

- `app-<name>@<version>`
- `package-<name>@<version>`

Examples:

- `app-web@1.0.0`
- `app-updates-worker@1.0.0`
- `app-mobile@1.0.0`
- `package-ui@1.0.0`

Any other tag format fails the release router.

## How app tags resolve

For `app-*` tags, the router maps the tag directly to an app directory:

- `app-web@1.0.0` -> `apps/web`
- `app-mobile@1.0.0` -> `apps/mobile`
- `app-updates-worker@1.0.0` -> `apps/updates-worker`

If the target directory does not exist at the tagged commit, the release fails.

## How app type is classified

After resolving the app directory at the tagged commit, the router classifies the app type:

- Cloudflare app:
  the app contains `wrangler.jsonc`, `wrangler.json`, or `wrangler.toml`
- Mobile app:
  the app `package.json` indicates Expo

Routing behavior:

- Cloudflare app tags call `Promote Cloudflare Production`
- Mobile app tags call `Mobile Production`

If an app exists but is neither Cloudflare nor Expo, the release fails.

In the current repo:

- `apps/web` is classified as Cloudflare
- `apps/updates-worker` is classified as Cloudflare
- `apps/mobile` is classified as mobile

## Retained deployment policies

Routing decides which production workflow runs. It does not change the existing deployment rules.

### Mobile production

The mobile production policy remains:

- if the current production-shaped fingerprint already matches a stored `profile=production` fingerprint for that version: run release update only
- if one or more production fingerprints are missing: compare the release tag version, `package.json` version, and effective Expo version
- if those versions do not match: fail
- if production history already contains that version but the current production-shaped fingerprint does not match it: fail and require a new app version
- otherwise: run native builds for the missing platform(s)

For the full fingerprint-history model, see [009-mobile-fingerprint-history.md](./009-mobile-fingerprint-history.md).

### Promote Cloudflare production

The Cloudflare promotion policy remains:

- the release tag must resolve to a commit reachable from `main`
- `production/cloudflare` must be fast-forwardable to the release commit
- at least one discovered Wrangler-backed app must have a changed `package.json` version between `production/cloudflare` and the release commit

If no discovered Cloudflare app version changed, the workflow fails.

## Unsupported package tags

`package-*` tags are recognized by the router but are not deployable yet.

For now:

- `package-*` tags fail
- the router summary explains that package releases are not supported for deployment yet

## Manual operations

Published releases should enter through `Release Router`.

Manual workflows are still available when needed:

- use `Mobile Production` with `workflow_dispatch` to run a manual mobile release evaluation for a specific app path and tag
- use `Promote Cloudflare Production` with `workflow_dispatch` to manually promote an existing release tag

The mobile production path currently preserves workflow routing and verification behavior, but the native Android and iOS build workflows are placeholders until a downstream product wires in real native build steps.
