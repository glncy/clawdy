import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { parse as parseJsonc } from "jsonc-parser";
import { parse as parseToml } from "toml";
import { readPackageVersionAtRef } from "./production-version-lock.js";

type PackageJson = {
  name?: string;
  version?: string;
};

type CloudflareApp = {
  appPath: string;
  packageName: string;
  workerName: string;
};

export type CloudflareVersionComparison = {
  baseVersion: string;
  headVersion: string;
};

const WRANGLER_FILES = ["wrangler.jsonc", "wrangler.json", "wrangler.toml"];

async function readPackageJson(packageJsonPath: string): Promise<PackageJson> {
  const contents = await readFile(packageJsonPath, "utf8");
  return JSON.parse(contents) as PackageJson;
}

function resolveGitRef(repoRoot: string, ref: string): string {
  return execFileSync("git", ["rev-parse", ref], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

function readCurrentPackageVersion(repoRoot: string, appPath: string): string {
  try {
    const contents = execFileSync("git", ["cat-file", "-p", `HEAD:${appPath}/package.json`], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const packageJson = JSON.parse(contents) as PackageJson;
    return packageJson.version ?? "";
  } catch {
    return "";
  }
}

async function findWranglerConfig(appDir: string): Promise<string | null> {
  for (const candidate of WRANGLER_FILES) {
    try {
      await readFile(join(appDir, candidate), "utf8");
      return candidate;
    } catch {
      continue;
    }
  }

  return null;
}

async function readWorkerName(wranglerConfigPath: string): Promise<string> {
  const contents = await readFile(wranglerConfigPath, "utf8");

  if (wranglerConfigPath.endsWith(".toml")) {
    const parsed = parseToml(contents) as { name?: string } | undefined;
    return typeof parsed?.name === "string" ? parsed.name : "";
  }

  const parsed = parseJsonc(contents) as { name?: string } | undefined;
  return parsed?.name ?? "";
}

export async function discoverCloudflareApps(repoRoot: string): Promise<CloudflareApp[]> {
  const appsRoot = join(repoRoot, "apps");
  const entries = await readdir(appsRoot);
  const apps: CloudflareApp[] = [];

  for (const entry of entries) {
    const appPath = `apps/${entry}`;
    const fullAppPath = join(repoRoot, appPath);
    const wranglerFile = await findWranglerConfig(fullAppPath);

    if (!wranglerFile) {
      continue;
    }

    const packageJson = await readPackageJson(join(fullAppPath, "package.json"));
    if (!packageJson.name) {
      continue;
    }

    const workerName = await readWorkerName(join(fullAppPath, wranglerFile));
    apps.push({
      appPath,
      packageName: packageJson.name,
      workerName,
    });
  }

  return apps.sort((left, right) => left.appPath.localeCompare(right.appPath));
}

export async function cloudflareReleaseVersionChanged({
  baseRef,
  headRef,
  repoRoot,
}: {
  baseRef: string;
  headRef: string;
  repoRoot: string;
}): Promise<boolean> {
  if (!headRef) {
    return false;
  }

  const cloudflareApps = await discoverCloudflareApps(repoRoot);
  const resolvedHeadRef = resolveGitRef(repoRoot, headRef);
  const currentHeadRef = resolveGitRef(repoRoot, "HEAD");

  return hasCloudflareVersionChange(
    cloudflareApps.map((app) => {
    const headVersion =
      resolvedHeadRef === currentHeadRef
        ? readCurrentPackageVersion(repoRoot, app.appPath)
        : readPackageVersionAtRef(repoRoot, resolvedHeadRef, app.appPath);
    const baseVersion = baseRef
      ? readPackageVersionAtRef(repoRoot, baseRef, app.appPath)
      : "";

      return {
        baseVersion,
        headVersion,
      };
    }),
  );
}

export function hasCloudflareVersionChange(
  versionComparisons: CloudflareVersionComparison[],
): boolean {
  return versionComparisons.some(
    ({ baseVersion, headVersion }) => headVersion !== "" && headVersion !== baseVersion,
  );
}
