import { latestCommitFingerprintChanges } from "../src/latest-commit-fingerprint-changes.js";

function createReadFileAtRefStub(files: Record<string, string | null>) {
  return (_repoRoot: string, ref: string, path: string) => files[`${ref}:${path}`] ?? null;
}

describe("latestCommitFingerprintChanges", () => {
  it("marks an internal android fingerprint refresh as buildable", async () => {
    const readFileAtRefImpl = createReadFileAtRefStub({
      "HEAD^:apps/mobile/fingerprints/android.json": JSON.stringify({
        "android-initial": { profile: "internal" },
      }),
      "HEAD:apps/mobile/fingerprints/android.json": JSON.stringify({
        "android-next": { profile: "internal" },
      }),
      "HEAD^:apps/mobile/fingerprints/ios.json": JSON.stringify({
        "ios-initial": { profile: "internal" },
      }),
      "HEAD:apps/mobile/fingerprints/ios.json": JSON.stringify({
        "ios-initial": { profile: "internal" },
      }),
    });

    await expect(
      latestCommitFingerprintChanges({
        androidFingerprintPath: "apps/mobile/fingerprints/android.json",
        headRef: "HEAD",
        iosFingerprintPath: "apps/mobile/fingerprints/ios.json",
        readFileAtRefImpl,
        repoRoot: "/repo",
      }),
    ).resolves.toEqual({
      androidChanged: true,
      androidProductionOnly: false,
      iosChanged: false,
      iosProductionOnly: false,
    });
  });

  it("marks an internal ios fingerprint refresh as buildable", async () => {
    const readFileAtRefImpl = createReadFileAtRefStub({
      "HEAD^:apps/mobile/fingerprints/android.json": JSON.stringify({
        "android-initial": { profile: "internal" },
      }),
      "HEAD:apps/mobile/fingerprints/android.json": JSON.stringify({
        "android-initial": { profile: "internal" },
      }),
      "HEAD^:apps/mobile/fingerprints/ios.json": JSON.stringify({
        "ios-initial": { profile: "internal" },
      }),
      "HEAD:apps/mobile/fingerprints/ios.json": JSON.stringify({
        "ios-next": { profile: "internal" },
      }),
    });

    await expect(
      latestCommitFingerprintChanges({
        androidFingerprintPath: "apps/mobile/fingerprints/android.json",
        headRef: "HEAD",
        iosFingerprintPath: "apps/mobile/fingerprints/ios.json",
        readFileAtRefImpl,
        repoRoot: "/repo",
      }),
    ).resolves.toEqual({
      androidChanged: false,
      androidProductionOnly: false,
      iosChanged: true,
      iosProductionOnly: false,
    });
  });

  it("marks internal refreshes on both platforms as buildable", async () => {
    const readFileAtRefImpl = createReadFileAtRefStub({
      "HEAD^:apps/mobile/fingerprints/android.json": JSON.stringify({
        "android-initial": { profile: "internal" },
      }),
      "HEAD:apps/mobile/fingerprints/android.json": JSON.stringify({
        "android-next": { profile: "internal" },
      }),
      "HEAD^:apps/mobile/fingerprints/ios.json": JSON.stringify({
        "ios-initial": { profile: "internal" },
      }),
      "HEAD:apps/mobile/fingerprints/ios.json": JSON.stringify({
        "ios-next": { profile: "internal" },
      }),
    });

    await expect(
      latestCommitFingerprintChanges({
        androidFingerprintPath: "apps/mobile/fingerprints/android.json",
        headRef: "HEAD",
        iosFingerprintPath: "apps/mobile/fingerprints/ios.json",
        readFileAtRefImpl,
        repoRoot: "/repo",
      }),
    ).resolves.toEqual({
      androidChanged: true,
      androidProductionOnly: false,
      iosChanged: true,
      iosProductionOnly: false,
    });
  });

  it("marks production refreshes on both platforms as non-buildable", async () => {
    const readFileAtRefImpl = createReadFileAtRefStub({
      "HEAD^:apps/mobile/fingerprints/android.json": JSON.stringify({
        "android-initial": { profile: "internal" },
      }),
      "HEAD:apps/mobile/fingerprints/android.json": JSON.stringify({
        "android-initial": { profile: "internal" },
        "android-production": { profile: "production" },
      }),
      "HEAD^:apps/mobile/fingerprints/ios.json": JSON.stringify({
        "ios-initial": { profile: "internal" },
      }),
      "HEAD:apps/mobile/fingerprints/ios.json": JSON.stringify({
        "ios-initial": { profile: "internal" },
        "ios-production": { profile: "production" },
      }),
    });

    await expect(
      latestCommitFingerprintChanges({
        androidFingerprintPath: "apps/mobile/fingerprints/android.json",
        headRef: "HEAD",
        iosFingerprintPath: "apps/mobile/fingerprints/ios.json",
        readFileAtRefImpl,
        repoRoot: "/repo",
      }),
    ).resolves.toEqual({
      androidChanged: true,
      androidProductionOnly: true,
      iosChanged: true,
      iosProductionOnly: true,
    });
  });

  it("treats deleted fingerprint entries as non-production-only changes", async () => {
    const readFileAtRefImpl = createReadFileAtRefStub({
      "HEAD^:apps/mobile/fingerprints/android.json": JSON.stringify({
        "android-initial": { profile: "production" },
        "android-old": { profile: "production" },
      }),
      "HEAD:apps/mobile/fingerprints/android.json": JSON.stringify({
        "android-initial": { profile: "production" },
      }),
      "HEAD^:apps/mobile/fingerprints/ios.json": JSON.stringify({
        "ios-initial": { profile: "internal" },
      }),
      "HEAD:apps/mobile/fingerprints/ios.json": JSON.stringify({
        "ios-initial": { profile: "internal" },
      }),
    });

    await expect(
      latestCommitFingerprintChanges({
        androidFingerprintPath: "apps/mobile/fingerprints/android.json",
        headRef: "HEAD",
        iosFingerprintPath: "apps/mobile/fingerprints/ios.json",
        readFileAtRefImpl,
        repoRoot: "/repo",
      }),
    ).resolves.toEqual({
      androidChanged: true,
      androidProductionOnly: false,
      iosChanged: false,
      iosProductionOnly: false,
    });
  });
});
