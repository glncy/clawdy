# CI Commenting And Mobile Workflow Reuse

## PR comments

PR failure comments are intentionally disabled for now.

The current source of truth is the failing GitHub Actions job output itself.

## Future GitHub App bot

If this repo later wants reliable PR comments, a dedicated GitHub App bot is the preferred path.

At a high level, the repository would need:

- `GH_APP_ID`
- `GH_APP_PRIVATE_KEY`

The workflow could then mint an installation token with the app and use that token to create PR comments reliably instead of depending on `GITHUB_TOKEN`.

## Mobile workflow reuse

The mobile CI workflows are parameterized so they can be reused for additional app directories such as `apps/example-mobile`.

The reusable inputs are:

- app path
- optional app label override

`determine-mobile-action.yml` also supports optional Android and iOS fingerprint path overrides when an app does not use the default fingerprint file locations.

Future mobile apps should be added by wiring a new caller configuration, not by copying the reusable fingerprint, build, or release workflows.

`Determine Required Workflows` stays generic for repo-wide checks only. App-specific fingerprint gating lives inside `mobile-fingerprint-check.yml`, where the workflow checks whether the given `app_path` changed before running fingerprint comparison.

## Current CI shape

Repo-wide PR and `main` checks run through one shared reusable workflow instead of separate `build`, `lint`, `type-check`, and `test` jobs.

That shared workflow:

- keeps `build` as an explicit check
- runs `lint`, `check-types`, and `test` after the build on the same runner
- avoids repeated checkout and dependency installation across separate jobs
- still reports failure if any required step fails

The retired reusable `run-command.yml` helper was moved to:

- [`run-command.yml`](../../.github/deprecated-workflows/run-command.yml)

See the example document for a concrete app wiring pattern using `apps/example-mobile`.

## Current mobile build status

The shared Android and iOS workflows are currently placeholder build steps in this boilerplate.

They preserve the workflow shape, environment wiring, and release orchestration points, but they do not yet perform real native build submissions. A downstream product should replace those placeholder steps with its actual Android and iOS build implementation.
