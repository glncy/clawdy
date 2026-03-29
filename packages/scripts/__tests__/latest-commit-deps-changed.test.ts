import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { latestCommitDepsChanged } from "../src/latest-commit-deps-changed.js";

describe("latestCommitDepsChanged", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "latest-commit-deps-changed-test-"));

    await mkdir(join(tempDir, "apps/mobile"), { recursive: true });
    await mkdir(join(tempDir, "packages/ui"), { recursive: true });
    await mkdir(join(tempDir, "apps/web"), { recursive: true });

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
      join(tempDir, "scripts.config.ts"),
      "const config = { \"deps-change\": { \"apps/mobile\": { exclude: [\"packages/scripts/**\"] } }, \"should-run\": {} };\n\nexport default config;\n",
      "utf8",
    );

    await writeFile(
      join(tempDir, "apps/mobile/package.json"),
      JSON.stringify(
        {
          dependencies: {
            "@repo/ui": "workspace:*",
          },
          name: "mobile",
        },
        null,
        2,
      ),
      "utf8",
    );

    await writeFile(
      join(tempDir, "packages/ui/package.json"),
      JSON.stringify(
        {
          name: "@repo/ui",
        },
        null,
        2,
      ),
      "utf8",
    );

    await writeFile(
      join(tempDir, "apps/web/package.json"),
      JSON.stringify(
        {
          name: "web",
        },
        null,
        2,
      ),
      "utf8",
    );
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("returns true when the latest PR head commit changes a workspace dependency", async () => {
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);

      if (url.endsWith("/pulls/31")) {
        return new Response(
          JSON.stringify({
            head: {
              sha: "pr-head-sha",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.endsWith("/commits/pr-head-sha")) {
        return new Response(
          JSON.stringify({
            files: [{ filename: "packages/ui/src/card.tsx" }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      throw new Error(`Unexpected URL: ${url}`);
    };

    await expect(
      latestCommitDepsChanged("apps/mobile", {
        event: "pull_request",
        fetchImpl,
        owner: "example-org",
        pullNumber: "31",
        repo: "starter-repo",
        repoRoot: tempDir,
      }),
    ).resolves.toBe(true);
  });

  it("returns false when the latest PR head commit changes an unrelated app", async () => {
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);

      if (url.endsWith("/pulls/31")) {
        return new Response(
          JSON.stringify({
            head: {
              sha: "pr-head-sha",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.endsWith("/commits/pr-head-sha")) {
        return new Response(
          JSON.stringify({
            files: [{ filename: "apps/web/src/page.tsx" }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      throw new Error(`Unexpected URL: ${url}`);
    };

    await expect(
      latestCommitDepsChanged("apps/mobile", {
        event: "pull_request",
        fetchImpl,
        owner: "example-org",
        pullNumber: "31",
        repo: "starter-repo",
        repoRoot: tempDir,
      }),
    ).resolves.toBe(false);
  });

  it("returns false when the latest PR head commit only changes an excluded tooling workspace", async () => {
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);

      if (url.endsWith("/pulls/31")) {
        return new Response(
          JSON.stringify({
            head: {
              sha: "pr-head-sha",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.endsWith("/commits/pr-head-sha")) {
        return new Response(
          JSON.stringify({
            files: [{ filename: "packages/scripts/src/cli.ts" }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      throw new Error(`Unexpected URL: ${url}`);
    };

    await expect(
      latestCommitDepsChanged("apps/mobile", {
        event: "pull_request",
        fetchImpl,
        owner: "example-org",
        pullNumber: "31",
        repo: "starter-repo",
        repoRoot: tempDir,
      }),
    ).resolves.toBe(false);
  });

  it("falls back to local git changed files when the push commit API returns 404", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response("not found", { status: 404, statusText: "Not Found" });

    await expect(
      latestCommitDepsChanged("apps/mobile", {
        event: "push",
        fetchImpl,
        getChangedFilesAtRefImpl: () => ["packages/ui/src/card.tsx"],
        headSha: "push-head-sha",
        owner: "example-org",
        repo: "starter-repo",
        repoRoot: tempDir,
      }),
    ).resolves.toBe(true);
  });
});
