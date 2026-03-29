import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const EXPO_CONFIG_FILES = ["app.json", "app.config.ts", "app.config.js"] as const;

type BumpStatus = "incremented" | "skipped_dynamic" | "unchanged";

type BumpResult = {
  androidVersionCodeIncremented: boolean;
  androidVersionCodeStatus: BumpStatus;
  configPath: string;
  iosBuildNumberIncremented: boolean;
  iosBuildNumberStatus: BumpStatus;
};

function readDiffForFile(repoRoot: string, headRef: string, filePath: string): string {
  try {
    return execFileSync("git", ["diff", `${headRef}^`, headRef, "--", filePath], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

function latestCommitChangedField(diff: string, fieldName: "buildNumber" | "versionCode"): boolean {
  const fieldPattern = new RegExp(`^[+-](?![+-]).*\\b${fieldName}\\b`, "m");
  return fieldPattern.test(diff);
}

async function findExpoConfigPath(projectRoot: string): Promise<string> {
  for (const fileName of EXPO_CONFIG_FILES) {
    const filePath = join(projectRoot, fileName);
    try {
      await readFile(filePath, "utf8");
      return filePath;
    } catch {
      continue;
    }
  }

  throw new Error(`Could not find Expo config file in ${projectRoot}. Expected one of: ${EXPO_CONFIG_FILES.join(", ")}`);
}

function incrementNumberString(value: string): string {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Expected a numeric string but received "${value}"`);
  }

  return String(parsed + 1);
}

function incrementNumber(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error(`Expected a finite number but received "${value}"`);
  }

  return value + 1;
}

async function updateAppJson(
  configPath: string,
  {
    shouldIncrementBuildNumber,
    shouldIncrementVersionCode,
  }: {
    shouldIncrementBuildNumber: boolean;
    shouldIncrementVersionCode: boolean;
  },
): Promise<BumpResult> {
  const contents = await readFile(configPath, "utf8");
  const parsed = JSON.parse(contents) as {
    expo?: {
      android?: { versionCode?: number };
      ios?: { buildNumber?: string };
    };
  };

  parsed.expo ??= {};
  parsed.expo.ios ??= {};
  parsed.expo.android ??= {};

  if (shouldIncrementBuildNumber) {
    parsed.expo.ios.buildNumber = parsed.expo.ios.buildNumber
      ? incrementNumberString(parsed.expo.ios.buildNumber)
      : "1";
  }

  if (shouldIncrementVersionCode) {
    parsed.expo.android.versionCode = typeof parsed.expo.android.versionCode === "number"
      ? incrementNumber(parsed.expo.android.versionCode)
      : 1;
  }

  await writeFile(configPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");

  return {
    androidVersionCodeIncremented: shouldIncrementVersionCode,
    androidVersionCodeStatus: shouldIncrementVersionCode ? "incremented" : "unchanged",
    configPath,
    iosBuildNumberIncremented: shouldIncrementBuildNumber,
    iosBuildNumberStatus: shouldIncrementBuildNumber ? "incremented" : "unchanged",
  };
}

function replaceNumberLiteral(
  contents: string,
  fieldName: "buildNumber" | "versionCode",
  shouldIncrement: boolean,
): { nextContents: string; status: BumpStatus; updated: boolean } {
  if (!shouldIncrement) {
    return { nextContents: contents, status: "unchanged", updated: false };
  }

  const pattern = new RegExp(`(\\b${fieldName}\\b\\s*:\\s*)(["']?)(\\d+)(\\2)`, "m");
  const match = contents.match(pattern);
  if (!match) {
    return {
      nextContents: contents,
      status: "skipped_dynamic",
      updated: false,
    };
  }

  const prefix = match[1] ?? "";
  const quote = match[2] ?? "";
  const value = match[3];
  if (!value) {
    return {
      nextContents: contents,
      status: "skipped_dynamic",
      updated: false,
    };
  }
  const incremented = String(Number.parseInt(value, 10) + 1);
  const replacement = `${prefix}${quote}${incremented}${quote}`;

  return {
    nextContents: contents.replace(pattern, replacement),
    status: "incremented",
    updated: true,
  };
}

async function updateAppConfigCode(
  configPath: string,
  {
    shouldIncrementBuildNumber,
    shouldIncrementVersionCode,
  }: {
    shouldIncrementBuildNumber: boolean;
    shouldIncrementVersionCode: boolean;
  },
): Promise<BumpResult> {
  let contents = await readFile(configPath, "utf8");

  const buildNumberResult = replaceNumberLiteral(
    contents,
    "buildNumber",
    shouldIncrementBuildNumber,
  );
  contents = buildNumberResult.nextContents;

  const versionCodeResult = replaceNumberLiteral(
    contents,
    "versionCode",
    shouldIncrementVersionCode,
  );
  contents = versionCodeResult.nextContents;

  if (buildNumberResult.updated || versionCodeResult.updated) {
    await writeFile(configPath, contents, "utf8");
  }

  return {
    androidVersionCodeIncremented: versionCodeResult.updated,
    androidVersionCodeStatus: versionCodeResult.status,
    configPath,
    iosBuildNumberIncremented: buildNumberResult.updated,
    iosBuildNumberStatus: buildNumberResult.status,
  };
}

export async function maybeIncrementExpoNativeBuildNumbers({
  headRef,
  projectRoot,
  repoRoot,
}: {
  headRef: string;
  projectRoot: string;
  repoRoot: string;
}): Promise<BumpResult> {
  const configPath = await findExpoConfigPath(projectRoot);
  const relativeConfigPath = relative(repoRoot, configPath) || configPath;
  const diff = headRef ? readDiffForFile(repoRoot, headRef, relativeConfigPath) : "";

  const shouldIncrementBuildNumber = !latestCommitChangedField(diff, "buildNumber");
  const shouldIncrementVersionCode = !latestCommitChangedField(diff, "versionCode");

  if (configPath.endsWith("app.json")) {
    return updateAppJson(configPath, {
      shouldIncrementBuildNumber,
      shouldIncrementVersionCode,
    });
  }

  return updateAppConfigCode(configPath, {
    shouldIncrementBuildNumber,
    shouldIncrementVersionCode,
  });
}
