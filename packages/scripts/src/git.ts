import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function resolveGitRef(repoRoot: string, ref: string): string {
  return execFileSync("git", ["rev-parse", ref], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

export function getCurrentBranchName(repoRoot: string): string | null {
  try {
    const branchName = execFileSync("git", ["symbolic-ref", "--short", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    return branchName || null;
  } catch {
    return null;
  }
}

export function readFileAtRef(repoRoot: string, ref: string, path: string): string | null {
  try {
    const resolvedRef = resolveGitRef(repoRoot, ref);
    const currentHead = resolveGitRef(repoRoot, "HEAD");

    if (currentHead === resolvedRef) {
      return readFileSync(join(repoRoot, path), "utf8");
    }

    return execFileSync("git", ["cat-file", "-p", `${resolvedRef}:${path}`], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

export function pathExistsAtRef(repoRoot: string, ref: string, path: string): boolean {
  try {
    const resolvedRef = resolveGitRef(repoRoot, ref);
    const currentHead = resolveGitRef(repoRoot, "HEAD");

    if (currentHead === resolvedRef) {
      return existsSync(join(repoRoot, path));
    }

    execFileSync("git", ["cat-file", "-e", `${resolvedRef}:${path}`], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

export function getChangedFilesAtRef(repoRoot: string, ref: string): string[] {
  try {
    const resolvedRef = resolveGitRef(repoRoot, ref);
    const output = execFileSync(
      "git",
      ["diff-tree", "--no-commit-id", "--name-only", "-m", "-r", resolvedRef],
      {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    );

    return output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}
