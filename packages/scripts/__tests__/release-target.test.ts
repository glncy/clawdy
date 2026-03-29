import { execSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { classifyReleaseTarget } from "../src/release-target.js";

describe("classifyReleaseTarget", () => {
  let tempDir: string;

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "release-target-test-"));

    await mkdir(join(tempDir, "apps/web"), { recursive: true });
    await mkdir(join(tempDir, "apps/mobile"), { recursive: true });
    await mkdir(join(tempDir, "apps/edge"), { recursive: true });
    await mkdir(join(tempDir, "apps/portal"), { recursive: true });
    await mkdir(join(tempDir, "packages/ui"), { recursive: true });

    await writeFile(
      join(tempDir, "apps/web/package.json"),
      JSON.stringify({ name: "web", private: true, version: "1.0.0" }, null, 2),
      "utf8",
    );
    await writeFile(
      join(tempDir, "apps/web/wrangler.jsonc"),
      `{
  "name": "web-worker"
}
`,
      "utf8",
    );

    await writeFile(
      join(tempDir, "apps/mobile/package.json"),
      JSON.stringify(
        {
          name: "mobile",
          main: "expo-router/entry",
          private: true,
          version: "1.0.0",
          dependencies: {
            expo: "~55.0.5",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    await writeFile(
      join(tempDir, "apps/edge/package.json"),
      JSON.stringify({ name: "edge", private: true, version: "1.0.0" }, null, 2),
      "utf8",
    );
    await writeFile(
      join(tempDir, "apps/edge/wrangler.toml"),
      `name = "edge-worker"
compatibility_date = "2026-03-28"
`,
      "utf8",
    );

    await writeFile(
      join(tempDir, "apps/portal/package.json"),
      JSON.stringify({ name: "portal", private: true, version: "1.0.0" }, null, 2),
      "utf8",
    );

    await writeFile(
      join(tempDir, "packages/ui/package.json"),
      JSON.stringify({ name: "@repo/ui", private: true, version: "1.0.0" }, null, 2),
      "utf8",
    );

    execSync("git init", { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.name "Test User"', { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.email "test@example.com"', { cwd: tempDir, stdio: "ignore" });
    execSync("git add .", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "initial"', { cwd: tempDir, stdio: "ignore" });
  });

  afterAll(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("classifies a Wrangler-backed app tag as Cloudflare", async () => {
    await expect(
      classifyReleaseTarget({
        headRef: "HEAD",
        repoRoot: tempDir,
        tagName: "app-web@1.0.0",
      }),
    ).resolves.toMatchObject({
      valid: true,
      tagKind: "app",
      targetName: "web",
      targetPath: "apps/web",
      targetType: "cloudflare",
    });
  });

  it("classifies an Expo app tag as mobile", async () => {
    await expect(
      classifyReleaseTarget({
        headRef: "HEAD",
        repoRoot: tempDir,
        tagName: "app-mobile@1.0.0",
      }),
    ).resolves.toMatchObject({
      valid: true,
      tagKind: "app",
      targetName: "mobile",
      targetPath: "apps/mobile",
      targetType: "mobile",
    });
  });

  it("classifies another Wrangler-backed app tag as Cloudflare", async () => {
    await expect(
      classifyReleaseTarget({
        headRef: "HEAD",
        repoRoot: tempDir,
        tagName: "app-edge@1.0.0",
      }),
    ).resolves.toMatchObject({
      valid: true,
      tagKind: "app",
      targetName: "edge",
      targetPath: "apps/edge",
      targetType: "cloudflare",
    });
  });

  it("fails when an app tag does not resolve to an existing app", async () => {
    await expect(
      classifyReleaseTarget({
        headRef: "HEAD",
        repoRoot: tempDir,
        tagName: "app-not-existing@1.0.0",
      }),
    ).resolves.toMatchObject({
      valid: false,
      tagKind: "app",
      targetName: "not-existing",
      targetType: "",
    });
  });

  it("fails when a package tag is not deployable yet", async () => {
    await expect(
      classifyReleaseTarget({
        headRef: "HEAD",
        repoRoot: tempDir,
        tagName: "package-ui@1.0.0",
      }),
    ).resolves.toMatchObject({
      valid: false,
      tagKind: "package",
      targetName: "ui",
      targetType: "",
    });
  });

  it("fails when the tag format is malformed", async () => {
    await expect(
      classifyReleaseTarget({
        headRef: "HEAD",
        repoRoot: tempDir,
        tagName: "web@1.0.0",
      }),
    ).resolves.toMatchObject({
      valid: false,
      tagKind: "",
      targetName: "",
      targetType: "",
    });
  });

  it("fails when an app is neither Expo nor Cloudflare", async () => {
    await expect(
      classifyReleaseTarget({
        headRef: "HEAD",
        repoRoot: tempDir,
        tagName: "app-portal@1.0.0",
      }),
    ).resolves.toMatchObject({
      valid: false,
      tagKind: "app",
      targetName: "portal",
      targetPath: "apps/portal",
      targetType: "",
    });
  });
});
