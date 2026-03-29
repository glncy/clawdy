# Mobile Fingerprint History

This document explains the mobile fingerprint-history model used by the shared Expo workflows.

## Why `.sha1` was replaced

The old model stored exactly one committed fingerprint per platform.

That worked only when an app had one canonical native state. It broke down once the same app version needed multiple valid binaries, such as:

- an internal build from `main` with channel `main`
- a production release-tag build with channel `production`
- a preview build from another branch

The current model stores a history of known-valid native fingerprints per platform instead of a single SHA.

## File locations

Each Expo app stores:

- `fingerprints/android.json`
- `fingerprints/ios.json`

These files live under the app directory, for example:

- `apps/mobile/fingerprints/android.json`
- `apps/mobile/fingerprints/ios.json`

In a fresh boilerplate repo, these files may start as empty JSON objects and grow over time as internal, preview, or production-native states are recorded.

## Schema

Each file is a JSON object keyed by the generated fingerprint hash.

Example `fingerprints/ios.json`:

```json
{
  "cc8929709566acfccc71f874a55b2a20bd5c23f4": {
    "version": "1.0.0",
    "buildNumber": "1",
    "profile": "internal",
    "ref": "main",
    "channel": "main",
    "createdAt": "2026-03-28T00:00:00.000Z"
  },
  "235c6b2f95ed777528a351f96a0a1744b9bc5b14": {
    "version": "1.0.0",
    "buildNumber": "2",
    "profile": "production",
    "ref": "app-mobile@1.0.0",
    "channel": "production",
    "createdAt": "2026-03-29T10:30:00.000Z"
  }
}
```

Example `fingerprints/android.json`:

```json
{
  "6207d08b1c95f4a0454fa23e44edf766171643d2": {
    "version": "1.0.0",
    "versionCode": 1,
    "profile": "internal",
    "ref": "main",
    "channel": "main",
    "createdAt": "2026-03-28T00:00:00.000Z"
  }
}
```

## Metadata meaning

- `version`: Expo app version from the effective config
- `buildNumber`: iOS native build number
- `versionCode`: Android native version code
- `profile`:
  - `internal` for `main`
  - `production` for release-tag production builds
  - `preview` for other refs
- `ref`: the actual branch or tag used to generate the entry
- `channel`: the resolved embedded `expo-channel-name`
- `createdAt`: UTC ISO timestamp when the entry was first added

Fingerprint entries are immutable. If a hash already exists in history, its metadata is not rewritten.

## Operational flow

### Pull requests

PR fingerprint checks run against preview semantics:

- if the generated fingerprint already exists in history, the check passes
- if the generated fingerprint is new, the check fails and signals that the native state is not yet recorded

### `main`

The main-branch refresh workflow runs with:

- `profile=internal`
- `ref=main`

If `main` produces a new fingerprint, the refresh workflow appends it to the history file and opens or updates a PR back to `main`.

### Production release tags

Production release tags run with:

- `profile=production`
- `ref=<release-tag>`

If the production-channel native fingerprint already exists in history, the mobile production workflow can continue with release-update-only behavior when no new native state is required.

If the production-channel fingerprint is missing:

- a native build runs for the missing platform(s)
- the fingerprint refresh workflow appends the new production entry
- a PR is created back to `main` so later production releases can recognize that native state as already known
