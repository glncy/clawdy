import { execSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { maybeIncrementExpoNativeBuildNumbers } from "../src/native-build-number.js";

describe("maybeIncrementExpoNativeBuildNumbers", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "native-build-version-test-"));
    await mkdir(join(tempDir, "apps/mobile"), { recursive: true });

    execSync("git init", { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.name "Test User"', { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.email "test@example.com"', { cwd: tempDir, stdio: "ignore" });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  async function writeAppJson(buildNumber = "2", versionCode = 2) {
    await writeFile(
      join(tempDir, "apps/mobile/app.json"),
      JSON.stringify(
        {
          expo: {
            ios: {
              buildNumber,
            },
            android: {
              versionCode,
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );
  }

  async function writeAppConfigJs(buildNumber = "2", versionCode = 2) {
    await writeFile(
      join(tempDir, "apps/mobile/app.config.js"),
      `export default {
  expo: {
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

  async function writeAppConfigTs(buildNumber = "2", versionCode = 2) {
    await writeFile(
      join(tempDir, "apps/mobile/app.config.ts"),
      `export default {
  expo: {
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

  async function writeDynamicAppConfigJs() {
    await writeFile(
      join(tempDir, "apps/mobile/app.config.js"),
      `const buildNumber = String(2);
const versionCode = Number.parseInt("2", 10);

export default {
  expo: {
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

  async function readAppJson() {
    const contents = await readFile(join(tempDir, "apps/mobile/app.json"), "utf8");
    return JSON.parse(contents) as {
      expo: {
        android: { versionCode: number };
        ios: { buildNumber: string };
      };
    };
  }

  async function readAppConfig(fileName: "app.config.js" | "app.config.ts") {
    return readFile(join(tempDir, "apps/mobile", fileName), "utf8");
  }

  it("increments buildNumber and versionCode when the latest commit did not change them", async () => {
    await writeAppJson("2", 2);
    execSync("git add .", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "initial"', { cwd: tempDir, stdio: "ignore" });

    await writeFile(join(tempDir, "apps/mobile/README.md"), "mobile docs\n", "utf8");
    execSync("git add .", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "docs"', { cwd: tempDir, stdio: "ignore" });

    const headRef = execSync("git rev-parse HEAD", {
      cwd: tempDir,
      encoding: "utf8",
    }).trim();

    await expect(
      maybeIncrementExpoNativeBuildNumbers({
        headRef,
        projectRoot: join(tempDir, "apps/mobile"),
        repoRoot: tempDir,
      }),
    ).resolves.toEqual({
      androidVersionCodeIncremented: true,
      androidVersionCodeStatus: "incremented",
      configPath: join(tempDir, "apps/mobile/app.json"),
      iosBuildNumberIncremented: true,
      iosBuildNumberStatus: "incremented",
    });

    await expect(readAppJson()).resolves.toEqual({
      expo: {
        android: {
          versionCode: 3,
        },
        ios: {
          buildNumber: "3",
        },
      },
    });
  });

  it("does not increment values already changed in the latest commit", async () => {
    await writeAppJson("2", 2);
    execSync("git add .", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "initial"', { cwd: tempDir, stdio: "ignore" });

    await writeAppJson("3", 3);
    execSync("git add apps/mobile/app.json", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "bump native versions"', { cwd: tempDir, stdio: "ignore" });

    const headRef = execSync("git rev-parse HEAD", {
      cwd: tempDir,
      encoding: "utf8",
    }).trim();

    await expect(
      maybeIncrementExpoNativeBuildNumbers({
        headRef,
        projectRoot: join(tempDir, "apps/mobile"),
        repoRoot: tempDir,
      }),
    ).resolves.toEqual({
      androidVersionCodeIncremented: false,
      androidVersionCodeStatus: "unchanged",
      configPath: join(tempDir, "apps/mobile/app.json"),
      iosBuildNumberIncremented: false,
      iosBuildNumberStatus: "unchanged",
    });

    await expect(readAppJson()).resolves.toEqual({
      expo: {
        android: {
          versionCode: 3,
        },
        ios: {
          buildNumber: "3",
        },
      },
    });
  });

  it("increments static literals in app.config.js when the latest commit did not change them", async () => {
    await writeAppConfigJs("2", 2);
    execSync("git add .", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "initial"', { cwd: tempDir, stdio: "ignore" });

    await writeFile(join(tempDir, "apps/mobile/README.md"), "mobile docs\n", "utf8");
    execSync("git add .", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "docs"', { cwd: tempDir, stdio: "ignore" });

    const headRef = execSync("git rev-parse HEAD", {
      cwd: tempDir,
      encoding: "utf8",
    }).trim();

    await expect(
      maybeIncrementExpoNativeBuildNumbers({
        headRef,
        projectRoot: join(tempDir, "apps/mobile"),
        repoRoot: tempDir,
      }),
    ).resolves.toEqual({
      androidVersionCodeIncremented: true,
      androidVersionCodeStatus: "incremented",
      configPath: join(tempDir, "apps/mobile/app.config.js"),
      iosBuildNumberIncremented: true,
      iosBuildNumberStatus: "incremented",
    });

    await expect(readAppConfig("app.config.js")).resolves.toContain('buildNumber: "3"');
    await expect(readAppConfig("app.config.js")).resolves.toContain("versionCode: 3");
  });

  it("does not increment static literals already changed in the latest commit for app.config.ts", async () => {
    await writeAppConfigTs("2", 2);
    execSync("git add .", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "initial"', { cwd: tempDir, stdio: "ignore" });

    await writeAppConfigTs("3", 3);
    execSync("git add apps/mobile/app.config.ts", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "bump native versions"', { cwd: tempDir, stdio: "ignore" });

    const headRef = execSync("git rev-parse HEAD", {
      cwd: tempDir,
      encoding: "utf8",
    }).trim();

    await expect(
      maybeIncrementExpoNativeBuildNumbers({
        headRef,
        projectRoot: join(tempDir, "apps/mobile"),
        repoRoot: tempDir,
      }),
    ).resolves.toEqual({
      androidVersionCodeIncremented: false,
      androidVersionCodeStatus: "unchanged",
      configPath: join(tempDir, "apps/mobile/app.config.ts"),
      iosBuildNumberIncremented: false,
      iosBuildNumberStatus: "unchanged",
    });

    await expect(readAppConfig("app.config.ts")).resolves.toContain('buildNumber: "3"');
    await expect(readAppConfig("app.config.ts")).resolves.toContain("versionCode: 3");
  });

  it("skips dynamic app.config.js values without failing", async () => {
    await writeDynamicAppConfigJs();
    execSync("git add .", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "initial"', { cwd: tempDir, stdio: "ignore" });

    await writeFile(join(tempDir, "apps/mobile/README.md"), "mobile docs\n", "utf8");
    execSync("git add .", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "docs"', { cwd: tempDir, stdio: "ignore" });

    const headRef = execSync("git rev-parse HEAD", {
      cwd: tempDir,
      encoding: "utf8",
    }).trim();

    await expect(
      maybeIncrementExpoNativeBuildNumbers({
        headRef,
        projectRoot: join(tempDir, "apps/mobile"),
        repoRoot: tempDir,
      }),
    ).resolves.toMatchObject({
      androidVersionCodeIncremented: false,
      androidVersionCodeStatus: "skipped_dynamic",
      configPath: join(tempDir, "apps/mobile/app.config.js"),
      iosBuildNumberIncremented: false,
      iosBuildNumberStatus: "skipped_dynamic",
    });

    await expect(readAppConfig("app.config.js")).resolves.toContain("buildNumber,");
    await expect(readAppConfig("app.config.js")).resolves.toContain("versionCode,");
  });
});
