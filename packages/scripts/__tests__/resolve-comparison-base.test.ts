import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

import { resolveComparisonBase } from "../src/resolve-comparison-base.js";

describe("resolveComparisonBase", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "resolve-comparison-base-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("returns the PR base SHA for pull request events", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ base: { sha: "base-sha-123" } }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });

    await expect(
      resolveComparisonBase({
        cwd: tempDir,
        event: "pull_request",
        fetchImpl,
        githubToken: "token",
        owner: "example-org",
        pullNumber: "30",
        repo: "starter-repo",
      }),
    ).resolves.toBe("base-sha-123");
  });

  it("returns an empty string when PR metadata is missing", async () => {
    await expect(
      resolveComparisonBase({
        cwd: tempDir,
        event: "pull_request",
        owner: "example-org",
        repo: "starter-repo",
      }),
    ).resolves.toBe("");
  });

  it("returns the first parent SHA for push events", async () => {
    await mkdir(join(tempDir, ".git"), { recursive: true });
    execSync("git init", { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.email "codex@example.com"', { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.name "Codex"', { cwd: tempDir, stdio: "ignore" });
    await writeFile(join(tempDir, "file.txt"), "one\n", "utf8");
    execSync("git add file.txt", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "first"', { cwd: tempDir, stdio: "ignore" });
    await writeFile(join(tempDir, "file.txt"), "two\n", "utf8");
    execSync("git add file.txt", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "second"', { cwd: tempDir, stdio: "ignore" });

    const expectedParent = execSync("git rev-parse HEAD^", {
      cwd: tempDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    await expect(
      resolveComparisonBase({
        cwd: tempDir,
        event: "push",
      }),
    ).resolves.toBe(expectedParent);
  });
});
