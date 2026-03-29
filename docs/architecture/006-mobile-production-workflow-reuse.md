# Mobile Production Workflow Reuse

This document explains how a future app like `apps/example-mobile` should be added to the production-tag release flow.

## Short answer

Do not create a separate workflow like `example-mobile-production.yml`.

Instead, reuse the shared production workflow pattern already implemented in:

- [`release-router.yml`](../../.github/workflows/release-router.yml)
- [`mobile-production-app.yml`](../../.github/workflows/mobile-production-app.yml)

The release router acts as the entrypoint for published releases, and the reusable app workflow contains the per-app mobile release logic.

To support another app, make sure it is tagged as `app-<name>@<version>` and that the app under `apps/<name>` is detectable as an Expo app.

## Why

The reusable logic already exists in:

- [`release-router.yml`](../../.github/workflows/release-router.yml)
- [`mobile-production-app.yml`](../../.github/workflows/mobile-production-app.yml)
- [`android-build.yml`](../../.github/workflows/android-build.yml)
- [`ios-build.yml`](../../.github/workflows/ios-build.yml)
- [`mobile-release-update.yml`](../../.github/workflows/mobile-release-update.yml)
- [`mobile-production-action.ts`](../../packages/scripts/src/mobile-production-action.ts)

The goal is to make the app classifiable by the router, not duplicate the workflow internals.

In the current boilerplate, `android-build.yml` and `ios-build.yml` are placeholder build workflows. They preserve the release orchestration and environment wiring, but a real product should replace their placeholder steps with actual native build logic.

## Current production behavior

For a published release, the router first classifies the tag as a mobile app release and then the shared production workflow evaluates the tagged commit for that app and applies this policy:

- static Expo config is prepared to `production` before fingerprint evaluation
- if the current production-shaped fingerprint already matches a stored `profile=production` fingerprint for that version: run release update only
- if one or more production fingerprints are missing: compare the release tag version, `package.json` version, and effective Expo version
- if those versions do not match: fail
- if production history already contains that version but the current production-shaped fingerprint does not match it: fail and require a new app version
- otherwise: run native builds for the missing platform(s)

That same production-shaped comparison is reused by `main` and PR fingerprint workflows.

## What to add for a new mobile app

If `apps/example-mobile` is added, extend the shared production workflow with another app-scoped path.

The release router resolves `app-example-mobile@<version>` to `apps/example-mobile`.

In practice, a new mobile app needs:

- a directory at `apps/example-mobile`
- a `package.json` that clearly identifies the app as Expo-based
- the expected fingerprint history files used by the shared mobile production workflow

The shared decision helper already derives:

- `apps/example-mobile/fingerprints/android.json`
- `apps/example-mobile/fingerprints/ios.json`

unless custom paths are passed explicitly.

For the full history model and schema, see [009-mobile-fingerprint-history.md](./009-mobile-fingerprint-history.md).

## Recommended pattern

When adding a second mobile app, keep one shared release router and one shared mobile production workflow.

That means:

- keep `release-router.yml`
- keep `mobile-production-app.yml`
- do not add `example-mobile-production.yml`
- rely on `app-example-mobile@<version>` tags routing to `apps/example-mobile`
