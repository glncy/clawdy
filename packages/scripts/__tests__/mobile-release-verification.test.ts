import type { resolveExpoFingerprintMetadata } from "../src/expo-config.js";
import { verifyMobileRelease } from "../src/mobile-release-verification.js";

type MockResolvedExpoConfig = Awaited<ReturnType<typeof resolveExpoFingerprintMetadata>>;

describe("verifyMobileRelease", () => {
  it("accepts matching package and Expo versions for a requested release channel", async () => {
    await expect(
      verifyMobileRelease({
        appPath: "apps/mobile",
        headRef: "main",
        readPackageVersionAtRefImpl: () => "1.2.3",
        releaseChannel: "production",
        repoRoot: "/tmp/repo",
        resolveExpoMetadataImpl: async () =>
          ({
            android: { versionCode: 12 },
            channel: "main",
            configPath: "apps/mobile/app.json",
            ios: { buildNumber: "12" },
            profile: "production",
            ref: "main",
            version: "1.2.3",
          }) as unknown as MockResolvedExpoConfig,
      }),
    ).resolves.toMatchObject({
      valid: true,
      versionMatches: true,
      releaseChannel: "production",
    });
  });

  it("fails when the package version and Expo version do not match", async () => {
    await expect(
      verifyMobileRelease({
        appPath: "apps/mobile",
        headRef: "main",
        readPackageVersionAtRefImpl: () => "1.2.3",
        releaseChannel: "production",
        repoRoot: "/tmp/repo",
        resolveExpoMetadataImpl: async () =>
          ({
            android: { versionCode: 12 },
            channel: "main",
            configPath: "apps/mobile/app.json",
            ios: { buildNumber: "12" },
            profile: "production",
            ref: "main",
            version: "1.2.4",
          }) as unknown as MockResolvedExpoConfig,
      }),
    ).resolves.toMatchObject({
      valid: false,
      versionMatches: false,
    });
  });
});
