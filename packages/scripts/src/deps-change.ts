import { readFile, readdir } from "node:fs/promises";
import { join, sep } from "node:path";

import { getChangedFiles as getChangedFilesFromGit } from "./changed-files.js";
import { matchesPatterns } from "./change-matching.js";
import { loadProjectConfig, type AppConfigPath } from "./project-config.js";

type DepsChangeOptions = {
  base?: string;
  getChangedFiles?: () => Promise<string[]>;
  repoRoot: string;
  verbose?: boolean;
};

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  name?: string;
};

async function readPackageJson(packageJsonPath: string): Promise<PackageJson> {
  const contents = await readFile(packageJsonPath, "utf8");
  return JSON.parse(contents) as PackageJson;
}

async function getWorkspaceRoots(repoRoot: string): Promise<string[]> {
  const rootPackageJson = await readPackageJson(join(repoRoot, "package.json"));
  const workspaces = Array.isArray((rootPackageJson as { workspaces?: unknown }).workspaces)
    ? ((rootPackageJson as { workspaces?: string[] }).workspaces ?? [])
    : [];

  return workspaces
    .filter((workspace) => workspace.endsWith("/*"))
    .map((workspace) => workspace.slice(0, -2))
    .filter(Boolean);
}

async function getPackageMap(repoRoot: string): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const workspaceRoots = await getWorkspaceRoots(repoRoot);

  for (const rootDir of workspaceRoots) {
    const fullRoot = join(repoRoot, rootDir);
    let entries: string[] = [];

    try {
      entries = await readdir(fullRoot);
    } catch {
      continue;
    }

    await Promise.all(
      entries.map(async (entry) => {
        const packageJsonPath = join(fullRoot, entry, "package.json");

        try {
          const packageJson = await readPackageJson(packageJsonPath);
          if (packageJson.name) {
            map.set(packageJson.name, `${rootDir}/${entry}`);
          }
        } catch {
          return;
        }
      }),
    );
  }

  return map;
}

function getWorkspaceDependencyNames(packageJson: PackageJson): string[] {
  return Object.entries({
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  })
    .filter(([, version]) => version.includes("workspace:"))
    .map(([name]) => name);
}

export async function depsChange(
  targetPath: string,
  { base, getChangedFiles, repoRoot, verbose }: DepsChangeOptions,
): Promise<boolean> {
  const appPath = targetPath.replace(/\/+$/, "");
  const packageJsonPath = join(repoRoot, appPath, "package.json");

  let appPackageJson: PackageJson;

  try {
    appPackageJson = await readPackageJson(packageJsonPath);
  } catch (error) {
    throw new Error(`Could not read package.json for deps-change path "${appPath}" at ${packageJsonPath}`, {
      cause: error,
    });
  }

  const packageMap = await getPackageMap(repoRoot);
  const workspaceDeps = getWorkspaceDependencyNames(appPackageJson);
  const config = await loadProjectConfig(repoRoot);
  const changedFiles = getChangedFiles
    ? await getChangedFiles()
    : await getChangedFilesFromGit({ base, cwd: repoRoot });

  if (changedFiles.length === 0) {
    return false;
  }

  const depsConfig = config["deps-change"] as
    | Partial<Record<AppConfigPath, { exclude?: string[]; include?: string[] }>>
    | undefined;
  const depsChangeRule = depsConfig?.[appPath as AppConfigPath] ?? {};
  const includePatterns = depsChangeRule.include ?? [];
  const excludePatterns = depsChangeRule.exclude ?? [];
  const relevantRoots = [appPath, ...workspaceDeps.flatMap((dependency) => {
    const resolved = packageMap.get(dependency);
    return resolved ? [resolved] : [];
  })];

  for (const file of changedFiles) {
    const isInRelevantRoot = relevantRoots.some((root) =>
      file === root || file.startsWith(`${root}${sep}`) || file.startsWith(`${root}/`),
    );
    const matchesInclude = matchesPatterns(file, includePatterns);
    const matchesExclude = matchesPatterns(file, excludePatterns);

    if (isInRelevantRoot) {
      if (matchesInclude || !matchesExclude) {
        if (verbose) {
          console.error(`deps-change match: ${file}`);
        }
        return true;
      }
      continue;
    }

    if (matchesInclude && !matchesExclude) {
      if (verbose) {
        console.error(`deps-change match: ${file}`);
      }
      return true;
    }
  }

  return false;
}
