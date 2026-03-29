import { execSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { getCurrentBranchName, pathExistsAtRef, readFileAtRef } from "../src/git.js";

describe("git helpers", () => {
  let tempDir: string;
  let branchName: string;

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "git-helper-test-"));

    await writeFile(join(tempDir, "package.json"), '{"name":"fixture"}\n', "utf8");

    execSync("git init -b main", { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.name "Test User"', { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.email "test@example.com"', { cwd: tempDir, stdio: "ignore" });
    execSync("git add package.json", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "initial"', { cwd: tempDir, stdio: "ignore" });

    branchName = execSync("git symbolic-ref --short HEAD", {
      cwd: tempDir,
      encoding: "utf8",
    }).trim();
  });

  afterAll(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("reads a file using a symbolic git ref", () => {
    expect(readFileAtRef(tempDir, branchName, "package.json")).toContain('"name":"fixture"');
  });

  it("checks file existence using a symbolic git ref", () => {
    expect(pathExistsAtRef(tempDir, branchName, "package.json")).toBe(true);
    expect(pathExistsAtRef(tempDir, branchName, "missing.json")).toBe(false);
  });

  it("returns the current branch name when HEAD is attached", () => {
    expect(getCurrentBranchName(tempDir)).toBe(branchName);
  });

  it("returns null when HEAD is detached", () => {
    const headSha = execSync("git rev-parse HEAD", {
      cwd: tempDir,
      encoding: "utf8",
    }).trim();

    execSync(`git checkout --detach ${headSha}`, {
      cwd: tempDir,
      stdio: "ignore",
    });

    expect(getCurrentBranchName(tempDir)).toBeNull();
  });
});
