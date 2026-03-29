import { determineProductionVersionLock } from "../src/production-version-lock.js";

describe("determineProductionVersionLock", () => {
  const resolveExpoMetadataImpl = async () => ({
    android: { versionCode: 2 },
    channel: "production",
    configPath: "apps/mobile/app.json",
    ios: { buildNumber: "2" },
    previewChannel: undefined,
    profile: "production" as const,
    ref: "HEAD",
    version: "0.0.3",
  });

  it("returns unlocked when production history does not contain the version", async () => {
    await expect(
      determineProductionVersionLock({
        appPath: "apps/mobile",
        headRef: "HEAD",
        repoRoot: "/repo",
        resolveExpoMetadataImpl,
        inspectFingerprintsImpl: async () => ({
          current: { android: "android-current", ios: "ios-current" },
          history: {
            android: {},
            ios: {},
          },
          missing: { android: true, ios: true },
        }),
      }),
    ).resolves.toMatchObject({
      productionVersionExists: false,
      state: "unlocked",
      version: "0.0.3",
    });
  });

  it("returns locked_match when production history contains the version and current production hashes match", async () => {
    await expect(
      determineProductionVersionLock({
        appPath: "apps/mobile",
        headRef: "HEAD",
        repoRoot: "/repo",
        resolveExpoMetadataImpl,
        inspectFingerprintsImpl: async () => ({
          current: { android: "android-current", ios: "ios-current" },
          history: {
            android: {
              "android-current": {
                channel: "production",
                createdAt: "2026-03-28T10:00:00.000Z",
                profile: "production",
                ref: "app-mobile@0.0.3",
                version: "0.0.3",
                versionCode: 2,
              },
            },
            ios: {
              "ios-current": {
                buildNumber: "2",
                channel: "production",
                createdAt: "2026-03-28T10:00:00.000Z",
                profile: "production",
                ref: "app-mobile@0.0.3",
                version: "0.0.3",
              },
            },
          },
          missing: { android: false, ios: false },
        }),
      }),
    ).resolves.toMatchObject({
      productionVersionExists: true,
      state: "locked_match",
      version: "0.0.3",
    });
  });

  it("returns locked_mismatch when production history contains the version but current production hashes do not match", async () => {
    await expect(
      determineProductionVersionLock({
        appPath: "apps/mobile",
        headRef: "HEAD",
        repoRoot: "/repo",
        resolveExpoMetadataImpl,
        inspectFingerprintsImpl: async () => ({
          current: { android: "android-current", ios: "ios-current" },
          history: {
            android: {
              "android-old": {
                channel: "production",
                createdAt: "2026-03-28T10:00:00.000Z",
                profile: "production",
                ref: "app-mobile@0.0.3",
                version: "0.0.3",
                versionCode: 2,
              },
            },
            ios: {
              "ios-old": {
                buildNumber: "2",
                channel: "production",
                createdAt: "2026-03-28T10:00:00.000Z",
                profile: "production",
                ref: "app-mobile@0.0.3",
                version: "0.0.3",
              },
            },
          },
          missing: { android: true, ios: true },
        }),
      }),
    ).resolves.toMatchObject({
      productionVersionExists: true,
      state: "locked_mismatch",
      version: "0.0.3",
    });
  });
});
