# 011: iOS Xcode Cloud Build And Fallback

## Status

Accepted

## Context

The mobile app uses Expo in a monorepo, but the native `ios/` project remains generated-only and is intentionally not committed.

We want:

- GitHub Actions to remain the orchestration layer for CI
- Xcode Cloud to remain the primary source of truth for Apple-native iOS builds
- a backup GitHub path when Xcode Cloud cannot start a build because of compute-hour or start-build limits
- explicit human approval before any fallback path is used

The repo uses a reusable iOS workflow that triggers Xcode Cloud through the App Store Connect API rather than archiving the app directly on GitHub-hosted runners.

## Decision

### Primary Build Path

The reusable iOS workflow in:

- [`.github/workflows/ios-build.yml`](../../.github/workflows/ios-build.yml)

does the following:

1. validates app metadata and required GitHub configuration
2. triggers Xcode Cloud using App Store Connect API credentials
3. records workflow/build metadata in the workflow summary

If the trigger succeeds, the final build path is:

- `xcode_cloud`

### Xcode Cloud Native Generation

Xcode Cloud owns the real Apple-native archive/sign/distribution steps.

The post-clone setup script lives at:

- [`apps/mobile/ci_scripts/ci_post_clone.sh`](../../apps/mobile/ci_scripts/ci_post_clone.sh)

That script currently runs:

```sh
bun install --frozen-lockfile
bun run build
bun x expo prebuild -p ios --clean --non-interactive
```

This means:

- monorepo dependencies are installed in the Xcode Cloud environment
- the workspace build runs before native generation
- Expo prebuild generates the iOS project during CI
- `ios/` remains untracked in git

We rely on Expo prebuild to own native project generation and CocoaPods setup. The script does not run a separate `pod install`.

### Fallback Path

If the Xcode Cloud trigger fails with a quota/start-build style condition, the workflow classifies the result as:

- `fallback_eligible`

The workflow then routes execution into a protected GitHub Environment:

- `app-mobile-fallback@main`
- `app-mobile-fallback@production`

Those environments must require manual reviewers.

After approval, the workflow runs a placeholder fallback job. That job does not yet perform a real iOS archive; it exists to:

- confirm approval happened
- mark the backup path as selected
- leave a clear workflow summary and audit trail

If the trigger fails because of credentials, workflow ID, git reference, or another non-quota API/config problem, the workflow classifies the result as:

- `hard_fail`

and stops without entering fallback approval.

## Required GitHub Configuration

### Secrets

- `APP_STORE_CONNECT_ISSUER_ID`
- `APP_STORE_CONNECT_KEY_ID`
- `APP_STORE_CONNECT_PRIVATE_KEY`

### Variables

- `XCODE_CLOUD_WORKFLOW_ID`
- `ENV_FILE` when mobile builds need environment values written into the app

### Protected Environments

Create these GitHub Environments with required reviewers:

- `app-mobile-fallback@main`
- `app-mobile-fallback@production`

## Setup Guide

### 1. Create An App Store Connect API Key

You need an App Store Connect API key with access to Xcode Cloud and workflow/build metadata.

In App Store Connect:

1. open **Users and Access**
2. open the **Integrations** tab
3. create a new API key
4. save the downloaded `.p8` file immediately

From that key, configure these GitHub secrets:

- `APP_STORE_CONNECT_KEY_ID`
  - the key identifier shown in App Store Connect
- `APP_STORE_CONNECT_ISSUER_ID`
  - the issuer ID shown for your App Store Connect API keys
- `APP_STORE_CONNECT_PRIVATE_KEY`
  - the contents of the downloaded `.p8` file
  - store the whole key body as the secret value
  - escaped newline handling is supported by the workflow script

### 2. Find The Xcode Cloud Workflow ID

The reusable GitHub workflow needs the App Store Connect workflow identifier for the iOS Xcode Cloud workflow.

Recommended way to find it:

1. open App Store Connect
2. open your app
3. open **Xcode Cloud**
4. select the workflow that should build the mobile app
5. inspect the browser URL or workflow details for the workflow identifier

Store that identifier as the GitHub variable:

- `XCODE_CLOUD_WORKFLOW_ID`

This value should point to the workflow that builds the `apps/mobile` app.

### 3. Configure The App Environment File

If the mobile workflow needs runtime values written into `.env`, set:

- `ENV_FILE`

as a GitHub Environment variable on the normal mobile environments.

The reusable workflow writes this content into the app before triggering Xcode Cloud.

### 4. Configure Fallback Approval Environments

In GitHub repository settings:

1. open **Settings**
2. open **Environments**
3. create:
   - `app-mobile-fallback@main`
   - `app-mobile-fallback@production`
4. add required reviewers

Those environments are used only when the Xcode Cloud trigger is fallback-eligible.

### 5. Configure Xcode Cloud To Use The Repo Script

In Xcode Cloud, ensure the mobile workflow runs the repo post-clone script:

- [`apps/mobile/ci_scripts/ci_post_clone.sh`](../../apps/mobile/ci_scripts/ci_post_clone.sh)

That script prepares the monorepo and generates the iOS project during the cloud build.

## Consequences

### Benefits

- iOS builds stay aligned with Apple-native infrastructure
- the repo does not need committed generated iOS source
- GitHub still provides orchestration, visibility, and approval controls
- fallback use is explicit and auditable

### Tradeoffs

- Xcode Cloud remains a hard dependency for the primary path
- there is no proactive remaining-hours check in this implementation
- the fallback path is placeholder-only until a real GitHub-hosted iOS build is added later
