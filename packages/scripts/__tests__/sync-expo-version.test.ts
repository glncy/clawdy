import { execSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { syncChangedExpoVersions, syncExpoVersion } from "../src/sync-expo-version.js";

describe("syncExpoVersion", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "sync-expo-version-test-"));
    await mkdir(join(tempDir, "apps/mobile"), { recursive: true });
    await mkdir(join(tempDir, "apps/example-mobile"), { recursive: true });

    execSync("git init", { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.name "Test User"', { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.email "test@example.com"', { cwd: tempDir, stdio: "ignore" });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  async function writePackageJson(appName: string, version = "1.0.1") {
    await writeFile(
      join(tempDir, `apps/${appName}/package.json`),
      `${JSON.stringify({ name: appName, version }, null, 2)}\n`,
      "utf8",
    );
  }

  async function writeAppJson(appName: string, version = "1.0.0") {
    await writeFile(
      join(tempDir, `apps/${appName}/app.json`),
      `${JSON.stringify({
        expo: {
          android: { versionCode: 7 },
          ios: { buildNumber: "9" },
          name: appName,
          version,
        },
      }, null, 2)}\n`,
      "utf8",
    );
  }

  async function writeAppConfigJs(appName: string, version = "1.0.0", buildNumber = "9", versionCode = 7) {
    await writeFile(
      join(tempDir, `apps/${appName}/app.config.js`),
      `export default {
  expo: {
    version: "${version}",
    ios: {
      buildNumber: "${buildNumber}",
    },
    android: {
      versionCode: ${versionCode},
    },
  },
};
`,
      "utf8",
    );
  }

  async function writeDynamicAppConfigJs(appName: string, version = "1.0.0") {
    await writeFile(
      join(tempDir, `apps/${appName}/app.config.js`),
      `const pkg = { version: "${version}" };
const buildNumber = String(Number.parseInt("9", 10));
const versionCode = Number.parseInt("7", 10);

export default {
  expo: {
    version: pkg.version,
    ios: {
      buildNumber,
    },
    android: {
      versionCode,
    },
  },
};
`,
      "utf8",
    );
  }

  async function readAppJson(appName: string) {
    const contents = await readFile(join(tempDir, `apps/${appName}/app.json`), "utf8");
    return JSON.parse(contents) as {
      expo: {
        android: { versionCode: number };
        ios: { buildNumber: string };
        name: string;
        version: string;
      };
    };
  }

  async function readAppConfigJs(appName: string) {
    return readFile(join(tempDir, `apps/${appName}/app.config.js`), "utf8");
  }

  async function writeAppConfigJsWithComments(appName: string, version = "1.0.0", buildNumber = "9", versionCode = 7) {
    await writeFile(
      join(tempDir, `apps/${appName}/app.config.js`),
      `export default {
  expo: {
    version: "${version}", // keep version comment
    ios: {
      buildNumber: "${buildNumber}", // keep build number comment
    },
    android: {
      versionCode: ${versionCode}, // keep versionCode comment
    },
  },
};
`,
      "utf8",
    );
  }

  it("syncs expo.version in app.json from package.json", async () => {
    await writePackageJson("mobile", "1.0.1");
    await writeAppJson("mobile", "1.0.0");

    await expect(
      syncExpoVersion({
        projectRoot: join(tempDir, "apps/mobile"),
      }),
    ).resolves.toEqual({
      androidVersionCodeStatus: "updated",
      configPath: join(tempDir, "apps/mobile/app.json"),
      iosBuildNumberStatus: "updated",
      packageJsonPath: join(tempDir, "apps/mobile/package.json"),
      updated: true,
      version: "1.0.1",
      versionStatus: "updated",
    });

    await expect(readAppJson("mobile")).resolves.toEqual({
      expo: {
        android: {
          versionCode: 1,
        },
        ios: {
          buildNumber: "1",
        },
        name: "mobile",
        version: "1.0.1",
      },
    });
  });

  it("skips rewriting when expo.version already matches package.json", async () => {
    await writePackageJson("mobile", "1.0.1");
    await writeAppJson("mobile", "1.0.1");

    await expect(
      syncExpoVersion({
        projectRoot: join(tempDir, "apps/mobile"),
      }),
    ).resolves.toEqual({
      androidVersionCodeStatus: "updated",
      configPath: join(tempDir, "apps/mobile/app.json"),
      iosBuildNumberStatus: "updated",
      packageJsonPath: join(tempDir, "apps/mobile/package.json"),
      updated: true,
      version: "1.0.1",
      versionStatus: "unchanged",
    });

    await expect(readAppJson("mobile")).resolves.toEqual({
      expo: {
        android: {
          versionCode: 1,
        },
        ios: {
          buildNumber: "1",
        },
        name: "mobile",
        version: "1.0.1",
      },
    });
  });

  it("syncs only apps whose staged package.json changed", async () => {
    await writePackageJson("mobile", "1.0.0");
    await writeAppJson("mobile", "1.0.0");
    await writePackageJson("example-mobile", "2.0.0");
    await writeAppJson("example-mobile", "2.0.0");
    execSync("git add .", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "initial"', { cwd: tempDir, stdio: "ignore" });

    await writePackageJson("mobile", "1.0.1");
    execSync("git add apps/mobile/package.json", { cwd: tempDir, stdio: "ignore" });

    await expect(
      syncChangedExpoVersions({
        repoRoot: tempDir,
      }),
    ).resolves.toEqual([
      {
        androidVersionCodeStatus: "updated",
        configPath: join(tempDir, "apps/mobile/app.json"),
        iosBuildNumberStatus: "updated",
        packageJsonPath: join(tempDir, "apps/mobile/package.json"),
        updated: true,
        version: "1.0.1",
        versionStatus: "updated",
      },
    ]);

    await expect(readAppJson("mobile")).resolves.toEqual({
      expo: {
        android: {
          versionCode: 1,
        },
        ios: {
          buildNumber: "1",
        },
        name: "mobile",
        version: "1.0.1",
      },
    });
    await expect(readAppJson("example-mobile")).resolves.toEqual({
      expo: {
        android: {
          versionCode: 7,
        },
        ios: {
          buildNumber: "9",
        },
        name: "example-mobile",
        version: "2.0.0",
      },
    });
  });

  it("syncs version and resets native build counters for static app.config.js", async () => {
    await writePackageJson("mobile", "1.0.1");
    await writeAppConfigJs("mobile", "1.0.0", "9", 7);

    await expect(
      syncExpoVersion({
        projectRoot: join(tempDir, "apps/mobile"),
      }),
    ).resolves.toMatchObject({
      androidVersionCodeStatus: "updated",
      configPath: join(tempDir, "apps/mobile/app.config.js"),
      iosBuildNumberStatus: "updated",
      updated: true,
      version: "1.0.1",
      versionStatus: "updated",
    });

    await expect(readAppConfigJs("mobile")).resolves.toContain('version: "1.0.1"');
    await expect(readAppConfigJs("mobile")).resolves.toContain('buildNumber: "1"');
    await expect(readAppConfigJs("mobile")).resolves.toContain("versionCode: 1");
  });

  it("skips dynamic app.config.js fields without failing", async () => {
    await writePackageJson("mobile", "1.0.1");
    await writeDynamicAppConfigJs("mobile", "1.0.0");

    await expect(
      syncExpoVersion({
        projectRoot: join(tempDir, "apps/mobile"),
      }),
    ).resolves.toMatchObject({
      androidVersionCodeStatus: "skipped_dynamic",
      configPath: join(tempDir, "apps/mobile/app.config.js"),
      iosBuildNumberStatus: "skipped_dynamic",
      updated: true,
      version: "1.0.1",
      versionStatus: "updated",
    });

    await expect(readAppConfigJs("mobile")).resolves.toContain('version: "1.0.1"');
    await expect(readAppConfigJs("mobile")).resolves.toContain('buildNumber,');
    await expect(readAppConfigJs("mobile")).resolves.toContain("versionCode,");
  });

  it("preserves inline comments when syncing static app.config.js literals", async () => {
    await writePackageJson("mobile", "1.0.1");
    await writeAppConfigJsWithComments("mobile", "1.0.0", "9", 7);

    await syncExpoVersion({
      projectRoot: join(tempDir, "apps/mobile"),
    });

    await expect(readAppConfigJs("mobile")).resolves.toContain('version: "1.0.1", // keep version comment');
    await expect(readAppConfigJs("mobile")).resolves.toContain('buildNumber: "1", // keep build number comment');
    await expect(readAppConfigJs("mobile")).resolves.toContain("versionCode: 1, // keep versionCode comment");
  });
});
