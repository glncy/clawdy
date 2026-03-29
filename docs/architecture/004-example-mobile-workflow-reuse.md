# Example Mobile Workflow Reuse

This example shows how a future app at `apps/example-mobile` can reuse the shared mobile CI workflows without copying their internal logic.

For production-tag release wiring, see [006-mobile-production-workflow-reuse.md](./006-mobile-production-workflow-reuse.md).

## Example caller pattern

```yml
  # file: .github/workflows/pr-workflow.yml
  example-mobile-fingerprint-check:
    name: Fingerprint Check
    needs: [determine-required-workflows, ci-checks]
    if: |
      needs.ci-checks.result == 'success'
    uses: ./.github/workflows/mobile-fingerprint-check.yml
    with:
      app_path: apps/example-mobile
      base_sha: ${{ github.event.pull_request.base.sha }}
      fingerprint_profile: preview
      fingerprint_ref: ${{ github.event.pull_request.head.ref }}
      head_sha: ${{ github.event.pull_request.head.sha }}

  # file: .github/workflows/pr-workflow.yml
  determine-example-mobile-action:
    name: "📱 Determine Mobile Action"
    needs: [determine-required-workflows, ci-checks, example-mobile-fingerprint-check]
    if: |
      needs.ci-checks.result == 'success' &&
      needs.example-mobile-fingerprint-check.result == 'success' &&
      needs.example-mobile-fingerprint-check.outputs.run-check == 'true'
    uses: ./.github/workflows/determine-mobile-action.yml
    with:
      event_name: ${{ github.event_name }}
      app_path: apps/example-mobile
      head_branch: ${{ github.event.pull_request.head.ref }}
      head_sha: ${{ github.event.pull_request.head.sha }}
      pull_number: ${{ github.event.pull_request.number }}

  # file: .github/workflows/pr-workflow.yml
  example-mobile-android-build:
    name: Android Build
    needs: determine-example-mobile-action
    if: needs.determine-example-mobile-action.outputs.run-android-build == 'true'
    uses: ./.github/workflows/android-build.yml
    with:
      app_path: apps/example-mobile
      head_branch: ${{ needs.determine-example-mobile-action.outputs.head-branch }}
      head_sha: ${{ needs.determine-example-mobile-action.outputs.head-sha }}

  # file: .github/workflows/pr-workflow.yml
  example-mobile-ios-build:
    name: iOS Build
    needs: determine-example-mobile-action
    if: needs.determine-example-mobile-action.outputs.run-ios-build == 'true'
    uses: ./.github/workflows/ios-build.yml
    with:
      app_path: apps/example-mobile
      head_branch: ${{ needs.determine-example-mobile-action.outputs.head-branch }}
      head_sha: ${{ needs.determine-example-mobile-action.outputs.head-sha }}

  # file: .github/workflows/pr-workflow.yml
  example-mobile-release-update:
    name: Release Update
    needs: determine-example-mobile-action
    if: needs.determine-example-mobile-action.outputs.run-mobile-release == 'true'
    uses: ./.github/workflows/mobile-release-update.yml
    with:
      app_path: apps/example-mobile
      head_branch: ${{ needs.determine-example-mobile-action.outputs.head-branch }}
      head_sha: ${{ needs.determine-example-mobile-action.outputs.head-sha }}
    secrets: inherit
```

## What changes per app

Only the app-specific inputs change:

- `app_path`
- optional `app_label`
- optional `android_fingerprint_path`
- optional `ios_fingerprint_path`

By default, `determine-mobile-action.yml` derives:

- the displayed app label from `app_path`
- `<app_path>/fingerprints/android.json`
- `<app_path>/fingerprints/ios.json`

You only need to pass `app_label` or explicit fingerprint paths if an app needs non-standard display text or file locations.

The reusable workflow logic stays the same for fingerprint checking, native builds, and release update routing. The generated native fingerprint only needs to already exist in the corresponding JSON history file for that platform.

In the current boilerplate, the Android and iOS build workflows are placeholders. Reusing the workflow shape is still the right pattern, but a real app should replace those placeholder build steps with actual native build logic.

## PR routing note

In the PR workflow, `Determine Mobile Action` should depend on that app's fingerprint workflow and only run when:

- `CI Checks` passed
- that app's fingerprint workflow succeeded
- that app's `mobile-fingerprint-check.yml` output `run-check` is `true`

That means:

- if `apps/example-mobile` did not change, `example-mobile-fingerprint-check` can return `run-check=false`
- then `determine-example-mobile-action` skips entirely
- if `run-check=true`, the build/release routing for that app proceeds
