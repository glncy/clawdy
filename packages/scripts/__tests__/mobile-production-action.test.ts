import { execFileSync, execSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  determineMobileProductionAction,
  mobileProductionPackageVersionChanged,
} from "../src/mobile-production-action.js";

describe("determineMobileProductionAction", () => {
  async function createTestRepo() {
    const repoRoot = await mkdtemp(join(tmpdir(), "mobile-production-action-test-"));
    await mkdir(join(repoRoot, "apps/mobile/fingerprints"), { recursive: true });

    await writeFile(
      join(repoRoot, "apps/mobile/package.json"),
      `${JSON.stringify({ name: "mobile", version: "1.0.0" }, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      join(repoRoot, "apps/mobile/app.json"),
      `${JSON.stringify({
        expo: {
          version: "1.0.0",
          ios: { buildNumber: "1" },
          android: { versionCode: 1 },
          updates: {
            requestHeaders: {
              "expo-channel-name": "production",
            },
          },
        },
      }, null, 2)}\n`,
      "utf8",
    );

    execSync("git init", { cwd: repoRoot, stdio: "ignore" });
    execSync('git config user.name "Test User"', { cwd: repoRoot, stdio: "ignore" });
    execSync('git config user.email "test@example.com"', { cwd: repoRoot, stdio: "ignore" });
    execSync("git add .", { cwd: repoRoot, stdio: "ignore" });
    execSync('git commit -m "initial"', { cwd: repoRoot, stdio: "ignore" });

    return repoRoot;
  }

  async function writePackageVersion(repoRoot: string, version: string) {
    await writeFile(
      join(repoRoot, "apps/mobile/package.json"),
      `${JSON.stringify({ name: "mobile", version }, null, 2)}\n`,
      "utf8",
    );
  }

  async function writeExpoVersion(repoRoot: string, version: string) {
    await writeFile(
      join(repoRoot, "apps/mobile/app.json"),
      `${JSON.stringify({
        expo: {
          version,
          ios: { buildNumber: "1" },
          android: { versionCode: 1 },
          updates: {
            requestHeaders: {
              "expo-channel-name": "production",
            },
          },
        },
      }, null, 2)}\n`,
      "utf8",
    );
  }

  async function commit(repoRoot: string, message: string, paths?: string[]) {
    execFileSync("git", ["add", ...(paths ?? ["."])], { cwd: repoRoot, stdio: "ignore" });
    execFileSync("git", ["commit", "-m", message], { cwd: repoRoot, stdio: "ignore" });
  }

  async function headRef(repoRoot: string) {
    return execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
  }

  function resolveExpoMetadata(version: string) {
    return async () => ({
      android: { versionCode: 1 },
      channel: "production",
      configPath: "apps/mobile/app.json",
      ios: { buildNumber: "1" },
      previewChannel: undefined,
      profile: "production" as const,
      ref: "HEAD",
      version,
    });
  }

  function readPackageVersion(currentVersion: string, previousVersion = currentVersion) {
    return (_repoRoot: string, ref: string) => (ref.endsWith("^") ? previousVersion : currentVersion);
  }

  it("routes to build when production fingerprints are missing and the release version is new", async () => {
    const repoRoot = await createTestRepo();
    try {
      await writePackageVersion(repoRoot, "1.0.1");
      await writeExpoVersion(repoRoot, "1.0.1");
      await commit(repoRoot, "mobile production release", [
        "apps/mobile/package.json",
        "apps/mobile/app.json",
      ]);

      await expect(
        determineMobileProductionAction({
          appPath: "apps/mobile",
          headRef: await headRef(repoRoot),
          profile: "production",
          ref: "app-mobile@1.0.1",
          repoRoot,
          inspectFingerprints: async () => ({
            current: {
              android: "android-prod",
              ios: "ios-known",
            },
            history: {
              android: {},
              ios: {
                "ios-known": {
                  buildNumber: "1",
                  channel: "production",
                  createdAt: "2026-03-28T10:00:00.000Z",
                  profile: "production",
                  ref: "app-mobile@1.0.0",
                  version: "1.0.0",
                },
              },
            },
            missing: {
              android: true,
              ios: false,
            },
          }),
          readPackageVersionAtRefImpl: readPackageVersion("1.0.1", "1.0.0"),
          resolveExpoMetadataImpl: resolveExpoMetadata("1.0.1"),
        }),
      ).resolves.toMatchObject({
        action: "build",
        androidFingerprintChanged: true,
        iosFingerprintChanged: false,
        runAndroidBuild: true,
        runIosBuild: false,
        runReleaseUpdate: false,
      });
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("detects when the app package version did not change in the tagged commit", async () => {
    const repoRoot = await createTestRepo();
    try {
      await writeFile(join(repoRoot, "README.md"), "docs\n", "utf8");
      await commit(repoRoot, "docs", ["README.md"]);

      expect(
        mobileProductionPackageVersionChanged({
          appPath: "apps/mobile",
          headRef: await headRef(repoRoot),
          repoRoot,
        }),
      ).toBe(false);
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("treats a release tag on the matching version as valid even with a retry suffix", async () => {
    const repoRoot = await createTestRepo();
    try {
      await expect(
        determineMobileProductionAction({
          appPath: "apps/mobile",
          headRef: await headRef(repoRoot),
          profile: "production",
          ref: "app-mobile@1.0.0-1",
          repoRoot,
          inspectFingerprints: async () => ({
            current: {
              android: "android-known",
              ios: "ios-known",
            },
            history: {
              android: {
                "android-known": {
                  channel: "production",
                  createdAt: "2026-03-28T10:00:00.000Z",
                  profile: "production",
                  ref: "app-mobile@1.0.0",
                  version: "1.0.0",
                  versionCode: 1,
                },
              },
              ios: {
                "ios-known": {
                  buildNumber: "1",
                  channel: "production",
                  createdAt: "2026-03-28T10:00:00.000Z",
                  profile: "production",
                  ref: "app-mobile@1.0.0",
                  version: "1.0.0",
                },
              },
            },
            missing: {
              android: false,
              ios: false,
            },
          }),
          readPackageVersionAtRefImpl: readPackageVersion("1.0.0"),
          resolveExpoMetadataImpl: resolveExpoMetadata("1.0.0"),
        }),
      ).resolves.toMatchObject({
        action: "release",
        runAndroidBuild: false,
        runIosBuild: false,
        runReleaseUpdate: true,
      });
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("treats an update suffix after the version as the same base app version", async () => {
    const repoRoot = await createTestRepo();
    try {
      await expect(
        determineMobileProductionAction({
          appPath: "apps/mobile",
          headRef: await headRef(repoRoot),
          profile: "production",
          ref: "app-mobile@1.0.0-update-1",
          repoRoot,
          inspectFingerprints: async () => ({
            current: {
              android: "android-known",
              ios: "ios-known",
            },
            history: {
              android: {
                "android-known": {
                  channel: "production",
                  createdAt: "2026-03-28T10:00:00.000Z",
                  profile: "production",
                  ref: "app-mobile@1.0.0",
                  version: "1.0.0",
                  versionCode: 1,
                },
              },
              ios: {
                "ios-known": {
                  buildNumber: "1",
                  channel: "production",
                  createdAt: "2026-03-28T10:00:00.000Z",
                  profile: "production",
                  ref: "app-mobile@1.0.0",
                  version: "1.0.0",
                },
              },
            },
            missing: {
              android: false,
              ios: false,
            },
          }),
          readPackageVersionAtRefImpl: readPackageVersion("1.0.0"),
          resolveExpoMetadataImpl: resolveExpoMetadata("1.0.0"),
        }),
      ).resolves.toMatchObject({
        action: "release",
        runAndroidBuild: false,
        runIosBuild: false,
        runReleaseUpdate: true,
      });
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("fails when a missing production fingerprint has mismatched tag and package versions", async () => {
    const repoRoot = await createTestRepo();
    try {
      await writePackageVersion(repoRoot, "1.0.1");
      await writeExpoVersion(repoRoot, "1.0.1");
      await commit(repoRoot, "mobile production release", [
        "apps/mobile/package.json",
        "apps/mobile/app.json",
      ]);

      await expect(
        determineMobileProductionAction({
          appPath: "apps/mobile",
          headRef: await headRef(repoRoot),
          profile: "production",
          ref: "app-mobile@1.0.2",
          repoRoot,
          inspectFingerprints: async () => ({
            current: {
              android: "android-known",
              ios: "ios-prod",
            },
            history: {
              android: {
                "android-known": {
                  channel: "production",
                  createdAt: "2026-03-28T10:00:00.000Z",
                  profile: "production",
                  ref: "app-mobile@1.0.0",
                  version: "1.0.0",
                  versionCode: 1,
                },
              },
              ios: {},
            },
            missing: {
              android: false,
              ios: true,
            },
          }),
          readPackageVersionAtRefImpl: readPackageVersion("1.0.1", "1.0.0"),
          resolveExpoMetadataImpl: resolveExpoMetadata("1.0.1"),
        }),
      ).resolves.toMatchObject({
        action: "fail",
        androidFingerprintChanged: false,
        iosFingerprintChanged: true,
        runAndroidBuild: false,
        runIosBuild: false,
        runReleaseUpdate: false,
      });
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("fails when a missing production fingerprint has mismatched package and Expo versions", async () => {
    const repoRoot = await createTestRepo();
    try {
      await writePackageVersion(repoRoot, "1.0.1");
      await commit(repoRoot, "version only", ["apps/mobile/package.json"]);

      await expect(
        determineMobileProductionAction({
          appPath: "apps/mobile",
          headRef: await headRef(repoRoot),
          profile: "production",
          ref: "app-mobile@1.0.1",
          repoRoot,
          inspectFingerprints: async () => ({
            current: {
              android: "android-new",
              ios: "ios-known",
            },
            history: {
              android: {
                "android-known": {
                  channel: "production",
                  createdAt: "2026-03-28T10:00:00.000Z",
                  profile: "production",
                  ref: "app-mobile@1.0.0",
                  version: "1.0.0",
                  versionCode: 1,
                },
              },
              ios: {
                "ios-known": {
                  buildNumber: "1",
                  channel: "production",
                  createdAt: "2026-03-28T10:00:00.000Z",
                  profile: "production",
                  ref: "app-mobile@1.0.0",
                  version: "1.0.0",
                },
              },
            },
            missing: {
              android: true,
              ios: false,
            },
          }),
          readPackageVersionAtRefImpl: readPackageVersion("1.0.1", "1.0.0"),
          resolveExpoMetadataImpl: resolveExpoMetadata("1.0.0"),
        }),
      ).resolves.toMatchObject({
        action: "fail",
        androidFingerprintChanged: true,
        iosFingerprintChanged: false,
        runAndroidBuild: false,
        runIosBuild: false,
        runReleaseUpdate: false,
      });
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("fails when the version already has a production fingerprint but the current production fingerprint no longer matches", async () => {
    const repoRoot = await createTestRepo();
    try {
      await writePackageVersion(repoRoot, "1.0.1");
      await writeExpoVersion(repoRoot, "1.0.1");
      await commit(repoRoot, "mobile production release", [
        "apps/mobile/package.json",
        "apps/mobile/app.json",
      ]);

      await expect(
        determineMobileProductionAction({
          appPath: "apps/mobile",
          headRef: await headRef(repoRoot),
          profile: "production",
          ref: "app-mobile@1.0.1",
          repoRoot,
          inspectFingerprints: async () => ({
            current: {
              android: "android-new",
              ios: "ios-known",
            },
            history: {
              android: {
                "android-known": {
                  channel: "production",
                  createdAt: "2026-03-28T10:00:00.000Z",
                  profile: "production",
                  ref: "app-mobile@1.0.0",
                  version: "1.0.1",
                  versionCode: 1,
                },
              },
              ios: {
                "ios-known": {
                  buildNumber: "1",
                  channel: "production",
                  createdAt: "2026-03-28T10:00:00.000Z",
                  profile: "production",
                  ref: "app-mobile@1.0.0",
                  version: "1.0.1",
                },
              },
            },
            missing: {
              android: true,
              ios: false,
            },
          }),
          readPackageVersionAtRefImpl: readPackageVersion("1.0.1", "1.0.0"),
          resolveExpoMetadataImpl: resolveExpoMetadata("1.0.1"),
        }),
      ).resolves.toMatchObject({
        action: "fail",
        androidFingerprintChanged: true,
        iosFingerprintChanged: false,
        runAndroidBuild: false,
        runIosBuild: false,
        runReleaseUpdate: false,
      });
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("routes to release update when both production fingerprints are already known for the version", async () => {
    const repoRoot = await createTestRepo();
    try {
      await expect(
        determineMobileProductionAction({
          appPath: "apps/mobile",
          headRef: await headRef(repoRoot),
          profile: "production",
          ref: "app-mobile@1.0.0",
          repoRoot,
          inspectFingerprints: async () => ({
            current: {
              android: "android-known",
              ios: "ios-known",
            },
            history: {
              android: {
                "android-known": {
                  channel: "production",
                  createdAt: "2026-03-28T10:00:00.000Z",
                  profile: "production",
                  ref: "app-mobile@1.0.0",
                  version: "1.0.0",
                  versionCode: 1,
                },
              },
              ios: {
                "ios-known": {
                  buildNumber: "1",
                  channel: "production",
                  createdAt: "2026-03-28T10:00:00.000Z",
                  profile: "production",
                  ref: "app-mobile@1.0.0",
                  version: "1.0.0",
                },
              },
            },
            missing: {
              android: false,
              ios: false,
            },
          }),
          readPackageVersionAtRefImpl: readPackageVersion("1.0.0"),
          resolveExpoMetadataImpl: resolveExpoMetadata("1.0.0"),
        }),
      ).resolves.toMatchObject({
        action: "release",
        androidFingerprintChanged: false,
        iosFingerprintChanged: false,
        runAndroidBuild: false,
        runIosBuild: false,
        runReleaseUpdate: true,
      });
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });
});
