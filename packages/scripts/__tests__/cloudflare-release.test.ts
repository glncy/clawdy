import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  discoverCloudflareApps,
  hasCloudflareVersionChange,
} from "../src/cloudflare-release.js";

describe("cloudflare release helpers", () => {
  async function createFixture() {
    const tempDir = await mkdtemp(join(tmpdir(), "cloudflare-release-test-"));

    await mkdir(join(tempDir, "apps/web"), { recursive: true });
    await mkdir(join(tempDir, "apps/edge"), { recursive: true });
    await mkdir(join(tempDir, "apps/gateway"), { recursive: true });
    await mkdir(join(tempDir, "apps/mobile"), { recursive: true });
    await mkdir(join(tempDir, "packages/ui"), { recursive: true });
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify(
        {
          private: true,
          workspaces: ["apps/*", "packages/*"],
        },
        null,
        2,
      ),
      "utf8",
    );

    await writeFile(
      join(tempDir, "apps/web/package.json"),
      JSON.stringify({ name: "web", private: true, version: "1.0.0" }, null, 2),
      "utf8",
    );
    await writeFile(
      join(tempDir, "apps/edge/package.json"),
      JSON.stringify({ name: "edge", private: true, version: "1.0.0" }, null, 2),
      "utf8",
    );
    await writeFile(
      join(tempDir, "apps/gateway/package.json"),
      JSON.stringify({ name: "gateway", private: true, version: "1.0.0" }, null, 2),
      "utf8",
    );
    await writeFile(
      join(tempDir, "apps/mobile/package.json"),
      JSON.stringify({ name: "mobile", private: true, version: "1.0.0" }, null, 2),
      "utf8",
    );
    await writeFile(
      join(tempDir, "packages/ui/package.json"),
      JSON.stringify({ name: "@repo/ui", private: true, version: "1.0.0" }, null, 2),
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
      join(tempDir, "apps/edge/wrangler.jsonc"),
      `{
  "name": "edge-worker"
}
`,
      "utf8",
    );
    await writeFile(
      join(tempDir, "apps/gateway/wrangler.toml"),
      `name = 'gateway-worker'
compatibility_date = "2026-03-28"

[env.preview]
vars = { APP_ENV = "preview" }
`,
      "utf8",
    );

    return tempDir;
  }

  it("discovers wrangler-configured apps dynamically", async () => {
    const tempDir = await createFixture();

    try {
      await expect(discoverCloudflareApps(tempDir)).resolves.toEqual([
        {
          appPath: "apps/edge",
          packageName: "edge",
          workerName: "edge-worker",
        },
        {
          appPath: "apps/gateway",
          packageName: "gateway",
          workerName: "gateway-worker",
        },
        {
          appPath: "apps/web",
          packageName: "web",
          workerName: "web-worker",
        },
      ]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("returns true when a discovered Cloudflare app version changes between refs", async () => {
    expect(
      hasCloudflareVersionChange([
        { baseVersion: "1.0.0", headVersion: "1.0.0" },
        { baseVersion: "1.0.0", headVersion: "1.0.1" },
      ]),
    ).toBe(true);
  });

  it("returns false when discovered Cloudflare app versions do not change between refs", async () => {
    expect(
      hasCloudflareVersionChange([
        { baseVersion: "1.0.0", headVersion: "1.0.0" },
        { baseVersion: "1.0.0", headVersion: "1.0.0" },
      ]),
    ).toBe(false);
  });

  it("returns true for a first-time promotion when the release ref contains a Cloudflare app version", async () => {
    expect(
      hasCloudflareVersionChange([
        { baseVersion: "", headVersion: "1.0.0" },
        { baseVersion: "", headVersion: "" },
      ]),
    ).toBe(true);
  });
});
