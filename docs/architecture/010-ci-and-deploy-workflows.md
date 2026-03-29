# CI And Deploy Workflows

This document describes the current CI shape for pull requests and `main`, plus the guardrails added to production deploy workflows.

## Consolidated CI checks

PR and `main` run one shared reusable workflow:

- [`ci-checks.yml`](../../.github/workflows/ci-checks.yml)

That workflow runs repo checks in this order:

1. `build`
2. `lint`
3. `check-types`
4. `test`

All four steps run on the same runner after one checkout and one environment setup.

`lint`, `check-types`, and `test` use `if: always()` so they still run after an earlier failure. The workflow then fails once at the end if any required step failed.

## Callers

The shared CI workflow is used by:

- [`pr-workflow.yml`](../../.github/workflows/pr-workflow.yml)
- [`main-branch.yml`](../../.github/workflows/main-branch.yml)

Those workflows still call `Determine Required Workflows` first, so only the necessary checks run for a given change set.

For mobile PR and `main` flows, the shared CI result is then followed by:

- `mobile-fingerprint-check.yml`
- `determine-mobile-action.yml`
- optional Android/iOS placeholder build workflows
- optional `mobile-release-update.yml`

## Deprecated workflow

The old reusable single-command runner is no longer used by PR or `main` CI:

- [`run-command.yml`](../../.github/deprecated-workflows/run-command.yml)

It was moved out of `.github/workflows` into `.github/deprecated-workflows` to make it clear that it is retired from the active CI path.

## Deploy guardrails

The production deploy/release workflows use non-canceling concurrency:

- [`release-router.yml`](../../.github/workflows/release-router.yml)
- [`mobile-production-app.yml`](../../.github/workflows/mobile-production-app.yml)
- [`mobile-release-update.yml`](../../.github/workflows/mobile-release-update.yml)
- [`promote-cloudflare-production.yml`](../../.github/workflows/promote-cloudflare-production.yml)

Each workflow sets `cancel-in-progress: false`. The goal is to avoid racing the same release target while also avoiding interruption of an in-flight production run.

## Post-deploy verification

Two internal verification steps were added:

- Cloudflare promotion fetches `origin/production/cloudflare` after the push and verifies that the remote branch points to the expected release SHA.
- Mobile release update runs a repo-scripts verification step after `expo-up release` to confirm the release channel and version metadata are internally consistent for that run.

## Current limitation

The boilerplate preserves the mobile release orchestration and decision logic, but the Android and iOS build workflows are still placeholders. Teams adopting this repo should replace those placeholder steps before relying on the mobile production path for real store builds.
