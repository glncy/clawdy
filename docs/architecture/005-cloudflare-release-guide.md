# Cloudflare Release Guide

This guide describes how to deploy Wrangler-backed Cloudflare apps in this repo.

## Scope

The production flow applies to any app under `apps/*` that contains one of:

- `wrangler.jsonc`
- `wrangler.json`
- `wrangler.toml`

Examples in the current repo include:

- `apps/web`
- `apps/updates-worker`

If a new app such as `apps/example-web` adds a Wrangler config file, it automatically becomes part of the Cloudflare production release train.

This classification is automatic and is based on the presence of a Wrangler config file plus a valid `package.json`.

## Branches And Triggers

- `main`
  Used for normal feature integration.
- `production/cloudflare`
  Used as the production branch watched by Cloudflare.
- `Release Router`
  Runs when a GitHub release is published, parses the release tag, and routes only supported app tags to the matching production workflow.
- `Changeset Release PR`
  Opens or updates the versioning PR from `main`.
- `Promote Cloudflare Production`
  Runs when manually dispatched or when called by `Release Router`, and fast-forwards `production/cloudflare` to the tagged release commit when a Wrangler-backed app version changed.

The promotion workflow also uses workflow concurrency and a post-push verification step to confirm the branch actually landed on the intended release SHA.

## Release steps

1. Merge app changes into `main`.
2. Add a changeset for any releasable package that should be versioned.
3. Wait for the `Changeset Release PR` workflow to open or update the `Version Packages` PR.
4. Review and merge the `Version Packages` PR into `main`.
5. Create and publish a GitHub release from that version commit using an app tag such as `app-web@1.0.0`.
6. Let `Release Router` classify the tag and call `Promote Cloudflare Production`.
7. Cloudflare deploys from `production/cloudflare`.

## Promotion rules

Publishing a GitHub release does not always move `production/cloudflare`.

Promotion only happens when:

- the release tag matches a deployable app tag such as `app-web@1.0.0`
- the tagged app resolves to an app under `apps/*`
- the resolved app contains a Wrangler config and is therefore classified as Cloudflare
- the release tag resolves to a commit reachable from `main`
- `production/cloudflare` can be fast-forwarded to that commit
- at least one discovered Cloudflare app has a changed `package.json` version between `production/cloudflare` and the release commit

If no Wrangler-backed app version changed, the workflow fails and Cloudflare does not deploy.

After promotion, the workflow fetches `origin/production/cloudflare` and verifies that it resolves to the expected release SHA. If the branch does not match, the workflow fails instead of reporting a silent success.

## Manual trigger

The promotion workflow also supports manual runs with `workflow_dispatch`.

Use it when you need to promote an already-created release tag:

- open `Promote Cloudflare Production`
- provide the release tag name
- run the workflow

The same promotion rules still apply.
