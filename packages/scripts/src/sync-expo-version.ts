import { execFileSync } from "node:child_process";
import { readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const EXPO_CONFIG_FILES = ["app.json", "app.config.ts", "app.config.js"] as const;

type PackageJson = {
  version?: string;
};

type AppJson = {
  expo?: {
    android?: { versionCode?: number };
    ios?: { buildNumber?: string };
    version?: string;
  };
};

type SyncStatus = "skipped_dynamic" | "unchanged" | "updated";

type SyncResult = {
  androidVersionCodeStatus: SyncStatus;
  configPath: string;
  iosBuildNumberStatus: SyncStatus;
  packageJsonPath: string;
  updated: boolean;
  version: string;
  versionStatus: SyncStatus;
};

async function findExpoConfigPath(projectRoot: string): Promise<string> {
  for (const fileName of EXPO_CONFIG_FILES) {
    const filePath = join(projectRoot, fileName);
    try {
      await stat(filePath);
      return filePath;
    } catch {
      continue;
    }
  }

  throw new Error(`Could not find Expo config file in ${projectRoot}. Expected one of: ${EXPO_CONFIG_FILES.join(", ")}`);
}

function replaceLiteral(
  contents: string,
  fieldName: "buildNumber" | "version" | "versionCode",
  nextValue: string,
  { quote }: { quote: '"' | "" },
): { nextContents: string; status: SyncStatus } {
  const pattern = new RegExp(`(\\b${fieldName}\\b\\s*:\\s*)(["']?)([^\\s,}\\n]+)(\\2)`, "m");
  const match = contents.match(pattern);
  if (!match) {
    return {
      nextContents: contents,
      status: "skipped_dynamic",
    };
  }

  const currentValue = (match[3] ?? "").trim().replace(/^["']|["']$/g, "");
  if (currentValue === nextValue) {
    return {
      nextContents: contents,
      status: "unchanged",
    };
  }

  const prefix = match[1] ?? "";
  const replacementValue = quote ? `${quote}${nextValue}${quote}` : nextValue;

  return {
    nextContents: contents.replace(pattern, `${prefix}${replacementValue}`),
    status: "updated",
  };
}

export async function syncExpoVersion({
  projectRoot,
}: {
  projectRoot: string;
}): Promise<SyncResult> {
  const packageJsonPath = join(projectRoot, "package.json");
  const configPath = await findExpoConfigPath(projectRoot);
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as PackageJson;

  const version = packageJson.version;
  if (!version) {
    throw new Error(`Expected version in ${packageJsonPath}`);
  }

  if (configPath.endsWith("app.json")) {
    const appJson = JSON.parse(await readFile(configPath, "utf8")) as AppJson;
    appJson.expo ??= {};
    appJson.expo.ios ??= {};
    appJson.expo.android ??= {};

    const versionStatus: SyncStatus = appJson.expo.version === version ? "unchanged" : "updated";
    const iosBuildNumberStatus: SyncStatus = appJson.expo.ios.buildNumber === "1" ? "unchanged" : "updated";
    const androidVersionCodeStatus: SyncStatus = appJson.expo.android.versionCode === 1 ? "unchanged" : "updated";

    appJson.expo.version = version;
    appJson.expo.ios.buildNumber = "1";
    appJson.expo.android.versionCode = 1;

    const updated = versionStatus === "updated" || iosBuildNumberStatus === "updated" || androidVersionCodeStatus === "updated";
    if (updated) {
      await writeFile(configPath, `${JSON.stringify(appJson, null, 2)}\n`, "utf8");
    }

    return {
      androidVersionCodeStatus,
      configPath,
      iosBuildNumberStatus,
      packageJsonPath,
      updated,
      version,
      versionStatus,
    };
  }

  let contents = await readFile(configPath, "utf8");
  const versionResult = replaceLiteral(contents, "version", version, { quote: '"' });
  contents = versionResult.nextContents;
  const buildNumberResult = replaceLiteral(contents, "buildNumber", "1", { quote: '"' });
  contents = buildNumberResult.nextContents;
  const versionCodeResult = replaceLiteral(contents, "versionCode", "1", { quote: "" });
  contents = versionCodeResult.nextContents;

  const updated = [versionResult.status, buildNumberResult.status, versionCodeResult.status].includes("updated");
  if (updated) {
    await writeFile(configPath, contents, "utf8");
  }

  return {
    androidVersionCodeStatus: versionCodeResult.status,
    configPath,
    iosBuildNumberStatus: buildNumberResult.status,
    packageJsonPath,
    updated,
    version,
    versionStatus: versionResult.status,
  };
}

function getChangedPackageJsonPaths(repoRoot: string): string[] {
  const output = execFileSync("git", ["status", "--short"], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  return Array.from(new Set(output
    .split("\n")
    .map((line) => line.slice(3).trim())
    .filter((line) => /^apps\/[^/]+\/package\.json$/.test(line))));
}

export async function syncChangedExpoVersions({
  repoRoot,
}: {
  repoRoot: string;
}): Promise<SyncResult[]> {
  const changedPackageJsonPaths = getChangedPackageJsonPaths(repoRoot);
  const results = await Promise.all(changedPackageJsonPaths.map(async (packageJsonPath) => {
    const projectRoot = packageJsonPath.replace(/\/package\.json$/, "");

    try {
      return await syncExpoVersion({
        projectRoot: join(repoRoot, projectRoot),
      });
    } catch {
      return null;
    }
  }));

  return results.filter((result) => result !== null);
}
