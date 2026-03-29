import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  prepareExpoProductionConfig,
  restoreExpoChannelFromRef,
  resolveExpoFingerprintMetadata,
} from "../src/expo-config.js";

describe("resolveExpoFingerprintMetadata", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "expo-config-test-"));
    await mkdir(join(tempDir, "apps/mobile"), { recursive: true });
    await writeFile(
      join(tempDir, "apps/mobile/package.json"),
      JSON.stringify({ name: "mobile", version: "1.0.0" }, null, 2),
      "utf8",
    );
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("reads channel metadata from app.json", async () => {
    await writeFile(
      join(tempDir, "apps/mobile/app.json"),
      JSON.stringify(
        {
          expo: {
            version: "1.0.0",
            ios: { buildNumber: "1" },
            android: { versionCode: 1 },
            updates: {
              requestHeaders: {
                "expo-channel-name": "main",
              },
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    await expect(
      resolveExpoFingerprintMetadata({
        projectRoot: join(tempDir, "apps/mobile"),
        ref: "main",
      }),
    ).resolves.toMatchObject({
      channel: "main",
      profile: "internal",
      version: "1.0.0",
      ios: { buildNumber: "1" },
      android: { versionCode: 1 },
    });
  });

  it("resolves effective channel from app.config.js using the inferred profile", async () => {
    await writeFile(
      join(tempDir, "apps/mobile/app.config.js"),
      `export default () => ({
  expo: {
    version: "1.0.0",
    ios: { buildNumber: "2" },
    android: { versionCode: 2 },
    updates: {
      requestHeaders: {
        "expo-channel-name": process.env.EAS_BUILD_PROFILE === "production" ? "production" : "preview",
      },
    },
  },
});
`,
      "utf8",
    );

    await expect(
      resolveExpoFingerprintMetadata({
        projectRoot: join(tempDir, "apps/mobile"),
        ref: "app-mobile@1.0.0",
      }),
    ).resolves.toMatchObject({
      channel: "production",
      profile: "production",
      ios: { buildNumber: "2" },
      android: { versionCode: 2 },
    });
  });

  it("resolves effective channel from app.config.ts for preview refs", async () => {
    await writeFile(
      join(tempDir, "apps/mobile/app.config.ts"),
      `export default () => ({
  expo: {
    version: "1.0.0",
    ios: { buildNumber: "3" },
    android: { versionCode: 3 },
    updates: {
      requestHeaders: {
        "expo-channel-name": process.env.EAS_BUILD_PROFILE === "preview" ? "preview" : "main",
      },
    },
  },
});
`,
      "utf8",
    );

    await expect(
      resolveExpoFingerprintMetadata({
        projectRoot: join(tempDir, "apps/mobile"),
        ref: "feature/some-branch",
      }),
    ).resolves.toMatchObject({
      channel: "preview",
      profile: "preview",
      previewChannel: "feature/some-branch",
      ios: { buildNumber: "3" },
      android: { versionCode: 3 },
    });
  });

  it("ignores app.eas.json for channel resolution", async () => {
    await writeFile(
      join(tempDir, "apps/mobile/app.eas.json"),
      JSON.stringify(
        {
          expo: {
            updates: {
              requestHeaders: {
                "expo-channel-name": "production",
              },
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      join(tempDir, "apps/mobile/app.json"),
      JSON.stringify(
        {
          expo: {
            version: "1.0.0",
            ios: { buildNumber: "1" },
            android: { versionCode: 1 },
            updates: {
              requestHeaders: {
                "expo-channel-name": "main",
              },
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    await expect(
      resolveExpoFingerprintMetadata({
        projectRoot: join(tempDir, "apps/mobile"),
        ref: "main",
      }),
    ).resolves.toMatchObject({
      channel: "main",
    });
  });

  it("rewrites app.json to production for release preparation", async () => {
    const configPath = join(tempDir, "apps/mobile/app.json");
    await writeFile(
      configPath,
      JSON.stringify(
        {
          expo: {
            version: "1.0.0",
            ios: { buildNumber: "1" },
            android: { versionCode: 1 },
            updates: {
              requestHeaders: {
                "expo-channel-name": "main",
              },
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    await expect(
      prepareExpoProductionConfig({
        projectRoot: join(tempDir, "apps/mobile"),
      }),
    ).resolves.toMatchObject({
      configType: "app.json",
      prepared: true,
      status: "updated_static",
    });

    await expect(
      resolveExpoFingerprintMetadata({
        projectRoot: join(tempDir, "apps/mobile"),
        ref: "app-mobile@1.0.0",
      }),
    ).resolves.toMatchObject({
      channel: "production",
    });

    await expect(readFile(configPath, "utf8")).resolves.toContain(
      '"expo-channel-name": "production"',
    );
  });

  it("rewrites static app.config.js to production for release preparation", async () => {
    const configPath = join(tempDir, "apps/mobile/app.config.js");
    await writeFile(
      configPath,
      `export default {
  expo: {
    version: "1.0.0",
    ios: { buildNumber: "2" },
    android: { versionCode: 2 },
    updates: {
      requestHeaders: {
        "expo-channel-name": "main",
      },
    },
  },
};
`,
      "utf8",
    );

    await expect(
      prepareExpoProductionConfig({
        projectRoot: join(tempDir, "apps/mobile"),
      }),
    ).resolves.toMatchObject({
      configType: "app.config.js",
      prepared: true,
      status: "updated_static",
    });

    await expect(readFile(configPath, "utf8")).resolves.toContain(
      '"expo-channel-name": "production"',
    );
  });

  it("rewrites static app.config.ts to production for release preparation", async () => {
    const configPath = join(tempDir, "apps/mobile/app.config.ts");
    await writeFile(
      configPath,
      `export default {
  expo: {
    version: "1.0.0",
    ios: { buildNumber: "3" },
    android: { versionCode: 3 },
    updates: {
      requestHeaders: {
        "expo-channel-name": "main",
      },
    },
  },
};
`,
      "utf8",
    );

    await expect(
      prepareExpoProductionConfig({
        projectRoot: join(tempDir, "apps/mobile"),
      }),
    ).resolves.toMatchObject({
      configType: "app.config.ts",
      prepared: true,
      status: "updated_static",
    });

    await expect(readFile(configPath, "utf8")).resolves.toContain(
      '"expo-channel-name": "production"',
    );
  });

  it("skips dynamic app.config.js during release preparation", async () => {
    const configPath = join(tempDir, "apps/mobile/app.config.js");
    const contents = `export default () => ({
  expo: {
    version: "1.0.0",
    ios: { buildNumber: "2" },
    android: { versionCode: 2 },
    updates: {
      requestHeaders: {
        "expo-channel-name": process.env.EAS_BUILD_PROFILE === "production" ? "production" : "preview",
      },
    },
  },
});
`;
    await writeFile(configPath, contents, "utf8");

    await expect(
      prepareExpoProductionConfig({
        projectRoot: join(tempDir, "apps/mobile"),
      }),
    ).resolves.toMatchObject({
      configType: "app.config.js",
      prepared: false,
      status: "skipped_dynamic",
    });

    await expect(readFile(configPath, "utf8")).resolves.toBe(contents);
  });

  it("skips dynamic app.config.ts during release preparation", async () => {
    const configPath = join(tempDir, "apps/mobile/app.config.ts");
    const contents = `export default () => ({
  expo: {
    version: "1.0.0",
    ios: { buildNumber: "3" },
    android: { versionCode: 3 },
    updates: {
      requestHeaders: {
        "expo-channel-name": process.env.EAS_BUILD_PROFILE === "preview" ? "preview" : "main",
      },
    },
  },
});
`;
    await writeFile(configPath, contents, "utf8");

    await expect(
      prepareExpoProductionConfig({
        projectRoot: join(tempDir, "apps/mobile"),
      }),
    ).resolves.toMatchObject({
      configType: "app.config.ts",
      prepared: false,
      status: "skipped_dynamic",
    });

    await expect(readFile(configPath, "utf8")).resolves.toBe(contents);
  });

  it("fails clearly when app.json is missing expo-channel-name", async () => {
    await writeFile(
      join(tempDir, "apps/mobile/app.json"),
      JSON.stringify(
        {
          expo: {
            version: "1.0.0",
            ios: { buildNumber: "1" },
            android: { versionCode: 1 },
            updates: {
              requestHeaders: {},
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    await expect(
      prepareExpoProductionConfig({
        projectRoot: join(tempDir, "apps/mobile"),
      }),
    ).rejects.toThrow("Expected expo-channel-name in");
  });

  it("restores app.json channel from the release commit without undoing other changes", async () => {
    const configPath = join(tempDir, "apps/mobile/app.json");
    await mkdir(join(tempDir, "apps/mobile/fingerprints"), { recursive: true });
    await writeFile(
      configPath,
      JSON.stringify(
        {
          expo: {
            version: "1.0.0",
            ios: { buildNumber: "1" },
            android: { versionCode: 1 },
            updates: {
              requestHeaders: {
                "expo-channel-name": "main",
              },
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const { execSync } = await import("node:child_process");
    execSync("git init", { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.name "Test User"', { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.email "test@example.com"', { cwd: tempDir, stdio: "ignore" });
    execSync("git add .", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "initial"', { cwd: tempDir, stdio: "ignore" });
    const headRef = execSync("git rev-parse HEAD", { cwd: tempDir, encoding: "utf8" }).trim();

    await writeFile(
      configPath,
      JSON.stringify(
        {
          expo: {
            version: "1.0.0",
            ios: { buildNumber: "2" },
            android: { versionCode: 2 },
            updates: {
              requestHeaders: {
                "expo-channel-name": "production",
              },
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    await expect(
      restoreExpoChannelFromRef({
        headRef,
        projectRoot: join(tempDir, "apps/mobile"),
        repoRoot: tempDir,
      }),
    ).resolves.toMatchObject({
      configType: "app.json",
      restored: true,
      status: "restored_static",
    });

    await expect(readFile(configPath, "utf8")).resolves.toContain(
      '"expo-channel-name": "main"',
    );
    await expect(readFile(configPath, "utf8")).resolves.toContain('"buildNumber": "2"');
    await expect(readFile(configPath, "utf8")).resolves.toContain('"versionCode": 2');
  });

  it("restores static app.config.js channel from the release commit", async () => {
    const configPath = join(tempDir, "apps/mobile/app.config.js");
    await writeFile(
      configPath,
      `export default {
  expo: {
    version: "1.0.0",
    ios: { buildNumber: "1" },
    android: { versionCode: 1 },
    updates: {
      requestHeaders: {
        "expo-channel-name": "main",
      },
    },
  },
};
`,
      "utf8",
    );

    const { execSync } = await import("node:child_process");
    execSync("git init", { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.name "Test User"', { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.email "test@example.com"', { cwd: tempDir, stdio: "ignore" });
    execSync("git add .", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "initial"', { cwd: tempDir, stdio: "ignore" });
    const headRef = execSync("git rev-parse HEAD", { cwd: tempDir, encoding: "utf8" }).trim();

    await writeFile(
      configPath,
      `export default {
  expo: {
    version: "1.0.0",
    ios: { buildNumber: "2" },
    android: { versionCode: 2 },
    updates: {
      requestHeaders: {
        "expo-channel-name": "production",
      },
    },
  },
};
`,
      "utf8",
    );

    await expect(
      restoreExpoChannelFromRef({
        headRef,
        projectRoot: join(tempDir, "apps/mobile"),
        repoRoot: tempDir,
      }),
    ).resolves.toMatchObject({
      configType: "app.config.js",
      restored: true,
      status: "restored_static",
    });

    await expect(readFile(configPath, "utf8")).resolves.toContain(
      '"expo-channel-name": "main"',
    );
    await expect(readFile(configPath, "utf8")).resolves.toContain('buildNumber: "2"');
    await expect(readFile(configPath, "utf8")).resolves.toContain("versionCode: 2");
  });
});
