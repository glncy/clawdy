import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";

import {
  type CreateProjectHash,
  compareFingerprints,
  generateFingerprints,
  getFingerprintPaths,
} from "../src/fingerprint.js";

const createProjectHashFromPlatform = (
  values: Record<"ios" | "android", string>,
): CreateProjectHash => {
  return async (_root, options) =>
    options?.platforms?.[0] === "ios" ? values.ios : values.android;
};

describe("fingerprint helpers", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "fingerprint-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { force: true, recursive: true });
  });

  it("writes ios and android fingerprint history files", async () => {
    const projectRoot = join(tempDir, "apps/mobile");
    const { outputDir } = getFingerprintPaths(projectRoot, tempDir);

    const result = await generateFingerprints({
      outputDir,
      projectRoot,
      createProjectHash: createProjectHashFromPlatform({
        android: "android-hash",
        ios: "ios-hash",
      }),
      metadata: {
        android: {
          channel: "main",
          createdAt: "2026-03-28T10:00:00.000Z",
          profile: "internal",
          ref: "main",
          version: "1.0.0",
          versionCode: 1,
        },
        ios: {
          buildNumber: "1",
          channel: "main",
          createdAt: "2026-03-28T10:00:00.000Z",
          profile: "internal",
          ref: "main",
          version: "1.0.0",
        },
      },
    });

    expect(result.current).toEqual({
      android: "android-hash",
      ios: "ios-hash",
    });
    expect(result.added).toEqual({
      android: true,
      ios: true,
    });

    await expect(readFile(join(outputDir, "ios.json"), "utf8")).resolves.toBe(
      `${JSON.stringify(
        {
          "ios-hash": {
            version: "1.0.0",
            buildNumber: "1",
            profile: "internal",
            ref: "main",
            channel: "main",
            createdAt: "2026-03-28T10:00:00.000Z",
          },
        },
        null,
        2,
      )}\n`,
    );
    await expect(readFile(join(outputDir, "android.json"), "utf8")).resolves.toBe(
      `${JSON.stringify(
        {
          "android-hash": {
            version: "1.0.0",
            versionCode: 1,
            profile: "internal",
            ref: "main",
            channel: "main",
            createdAt: "2026-03-28T10:00:00.000Z",
          },
        },
        null,
        2,
      )}\n`,
    );
  });

  it("passes when generated hashes already exist in fingerprint history", async () => {
    const projectRoot = join(tempDir, "apps/mobile");
    const { outputDir } = getFingerprintPaths(projectRoot, tempDir);

    await generateFingerprints({
      outputDir,
      projectRoot,
      createProjectHash: createProjectHashFromPlatform({
        android: "android-hash",
        ios: "ios-hash",
      }),
      metadata: {
        android: {
          channel: "main",
          createdAt: "2026-03-28T10:00:00.000Z",
          profile: "internal",
          ref: "main",
          version: "1.0.0",
          versionCode: 1,
        },
        ios: {
          buildNumber: "1",
          channel: "main",
          createdAt: "2026-03-28T10:00:00.000Z",
          profile: "internal",
          ref: "main",
          version: "1.0.0",
        },
      },
    });

    await expect(
      compareFingerprints({
        outputDir,
        projectRoot,
        repoRoot: tempDir,
        createProjectHash: createProjectHashFromPlatform({
          android: "android-hash",
          ios: "ios-hash",
        }),
      }),
    ).resolves.toMatchObject({
      current: {
        android: "android-hash",
        ios: "ios-hash",
      },
      missing: {
        android: false,
        ios: false,
      },
    });
  });

  it("fails clearly when fingerprint history files are missing", async () => {
    const projectRoot = join(tempDir, "apps/mobile");
    const { outputDir } = getFingerprintPaths(projectRoot, tempDir);

    await expect(
      compareFingerprints({
        outputDir,
        projectRoot,
        repoRoot: tempDir,
        createProjectHash: async () => "unused",
      }),
    ).rejects.toThrow("Missing fingerprint file: apps/mobile/fingerprints/ios.json");
  });

  it("fails clearly when a generated fingerprint hash is not in history", async () => {
    const projectRoot = join(tempDir, "apps/mobile");
    const { outputDir } = getFingerprintPaths(projectRoot, tempDir);

    await generateFingerprints({
      outputDir,
      projectRoot,
      createProjectHash: createProjectHashFromPlatform({
        android: "android-hash",
        ios: "old-ios-hash",
      }),
      metadata: {
        android: {
          channel: "main",
          createdAt: "2026-03-28T10:00:00.000Z",
          profile: "internal",
          ref: "main",
          version: "1.0.0",
          versionCode: 1,
        },
        ios: {
          buildNumber: "1",
          channel: "main",
          createdAt: "2026-03-28T10:00:00.000Z",
          profile: "internal",
          ref: "main",
          version: "1.0.0",
        },
      },
    });

    await expect(
      compareFingerprints({
        outputDir,
        projectRoot,
        repoRoot: tempDir,
        createProjectHash: createProjectHashFromPlatform({
          android: "android-hash",
          ios: "new-ios-hash",
        }),
      }),
    ).rejects.toThrow(
      "Fingerprint history missing hash for ios: new-ios-hash",
    );
  });

  it("appends only missing hashes and preserves existing metadata", async () => {
    const projectRoot = join(tempDir, "apps/mobile");
    const { outputDir } = getFingerprintPaths(projectRoot, tempDir);

    await generateFingerprints({
      outputDir,
      projectRoot,
      createProjectHash: createProjectHashFromPlatform({
        android: "android-hash",
        ios: "ios-hash",
      }),
      metadata: {
        android: {
          channel: "main",
          createdAt: "2026-03-28T10:00:00.000Z",
          profile: "internal",
          ref: "main",
          version: "1.0.0",
          versionCode: 1,
        },
        ios: {
          buildNumber: "1",
          channel: "main",
          createdAt: "2026-03-28T10:00:00.000Z",
          profile: "internal",
          ref: "main",
          version: "1.0.0",
        },
      },
    });

    const result = await generateFingerprints({
      outputDir,
      projectRoot,
      createProjectHash: createProjectHashFromPlatform({
        android: "android-hash",
        ios: "ios-prod-hash",
      }),
      metadata: {
        android: {
          channel: "production",
          createdAt: "2026-03-28T12:00:00.000Z",
          profile: "production",
          ref: "app-mobile@1.0.0",
          version: "1.0.0",
          versionCode: 2,
        },
        ios: {
          buildNumber: "2",
          channel: "production",
          createdAt: "2026-03-28T12:00:00.000Z",
          profile: "production",
          ref: "app-mobile@1.0.0",
          version: "1.0.0",
        },
      },
    });

    expect(result.added).toEqual({
      android: false,
      ios: true,
    });
    await expect(readFile(join(outputDir, "android.json"), "utf8")).resolves.toContain(
      '"createdAt": "2026-03-28T10:00:00.000Z"',
    );
    await expect(readFile(join(outputDir, "android.json"), "utf8")).resolves.not.toContain(
      '"createdAt": "2026-03-28T12:00:00.000Z"',
    );
    await expect(readFile(join(outputDir, "ios.json"), "utf8")).resolves.toContain(
      '"ios-prod-hash"',
    );
  });

  it("resolves fingerprint output inside the provided project path", () => {
    const projectRoot = join(tempDir, "apps/mobile");

    expect(getFingerprintPaths(projectRoot, tempDir)).toEqual({
      outputDir: join(projectRoot, "fingerprints"),
      projectRoot,
      relativeOutputDir: relative(tempDir, join(projectRoot, "fingerprints")),
    });
  });

  it("stores previewChannel for preview fingerprint entries", async () => {
    const projectRoot = join(tempDir, "apps/mobile");
    const { outputDir } = getFingerprintPaths(projectRoot, tempDir);

    await generateFingerprints({
      outputDir,
      projectRoot,
      createProjectHash: createProjectHashFromPlatform({
        android: "android-preview-hash",
        ios: "ios-preview-hash",
      }),
      metadata: {
        android: {
          channel: "main",
          createdAt: "2026-03-28T10:00:00.000Z",
          previewChannel: "codex/mobile-production-release-flow",
          profile: "preview",
          ref: "codex/mobile-production-release-flow",
          version: "0.0.1",
          versionCode: 2,
        },
        ios: {
          buildNumber: "2",
          channel: "main",
          createdAt: "2026-03-28T10:00:00.000Z",
          previewChannel: "codex/mobile-production-release-flow",
          profile: "preview",
          ref: "codex/mobile-production-release-flow",
          version: "0.0.1",
        },
      },
    });

    await expect(readFile(join(outputDir, "ios.json"), "utf8")).resolves.toContain(
      '"previewChannel": "codex/mobile-production-release-flow"',
    );
    await expect(readFile(join(outputDir, "android.json"), "utf8")).resolves.toContain(
      '"previewChannel": "codex/mobile-production-release-flow"',
    );
  });
});
