import { getConfig, getConfigFilePaths } from "@expo/config";
import { execFileSync } from "node:child_process";
import { readFile, stat, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

export const EXPO_CONFIG_FILES = ["app.json", "app.config.ts", "app.config.js"] as const;

type ExpoConfigPath = typeof EXPO_CONFIG_FILES[number];
type FingerprintProfile = "internal" | "preview" | "production";
type PrepareStatus = "already_production" | "skipped_dynamic" | "updated_static";

type ResolvedExpoConfig = {
  android: {
    versionCode: number;
  };
  channel: string;
  configPath: string;
  ios: {
    buildNumber: string;
  };
  profile: FingerprintProfile;
  previewChannel?: string;
  ref: string;
  version: string;
};

type PreparedExpoConfig = {
  configPath: string;
  configType: ExpoConfigPath;
  prepared: boolean;
  status: PrepareStatus;
};

type RestoreStatus = "restored_static" | "skipped_dynamic";

type RestoredExpoChannel = {
  configPath: string;
  configType: ExpoConfigPath;
  restored: boolean;
  status: RestoreStatus;
};

function normalizeRef(ref?: string): string {
  return ref?.trim() || "HEAD";
}

export async function withExpoBuildProfile<T>(
  profile: FingerprintProfile | undefined,
  callback: () => Promise<T>,
): Promise<T> {
  if (!profile) {
    return callback();
  }

  const previousProfile = process.env.EAS_BUILD_PROFILE;
  process.env.EAS_BUILD_PROFILE = profile;

  try {
    return await callback();
  } finally {
    if (previousProfile === undefined) {
      delete process.env.EAS_BUILD_PROFILE;
    } else {
      process.env.EAS_BUILD_PROFILE = previousProfile;
    }
  }
}

export function inferFingerprintProfile(ref?: string): FingerprintProfile {
  const normalizedRef = normalizeRef(ref);
  if (normalizedRef === "main") {
    return "internal";
  }

  if (/^app-.+@.+$/.test(normalizedRef)) {
    return "production";
  }

  return "preview";
}

export async function findExpoConfigPath(projectRoot: string): Promise<string> {
  for (const fileName of EXPO_CONFIG_FILES) {
    const filePath = join(projectRoot, fileName);
    try {
      await stat(filePath);
      return filePath;
    } catch {
      continue;
    }
  }

  throw new Error(
    `Could not find Expo config file in ${projectRoot}. Expected one of: ${EXPO_CONFIG_FILES.join(", ")}`,
  );
}

function getExpoConfigType(configPath: string): ExpoConfigPath {
  const fileName = basename(configPath);

  if ((EXPO_CONFIG_FILES as readonly string[]).includes(fileName)) {
    return fileName as ExpoConfigPath;
  }

  throw new Error(`Unsupported Expo config file: ${configPath}`);
}

function readConfigAtRef(repoRoot: string, ref: string, projectRoot: string, configType: ExpoConfigPath): string {
  const projectRelativePath = projectRoot.slice(repoRoot.length + 1);
  return execFileSync("git", ["show", `${ref}:${join(projectRelativePath, configType)}`], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
}

async function prepareAppJsonForProduction(configPath: string): Promise<PreparedExpoConfig> {
  const contents = await readFile(configPath, "utf8");
  const parsed = JSON.parse(contents) as {
    expo?: {
      updates?: {
        requestHeaders?: Record<string, string | undefined>;
      };
    };
  };
  const currentChannel = parsed.expo?.updates?.requestHeaders?.["expo-channel-name"];

  if (!currentChannel) {
    throw new Error(`Expected expo-channel-name in ${configPath}`);
  }

  if (currentChannel === "production") {
    return {
      configPath,
      configType: "app.json",
      prepared: false,
      status: "already_production",
    };
  }

  parsed.expo ??= {};
  parsed.expo.updates ??= {};
  parsed.expo.updates.requestHeaders ??= {};
  parsed.expo.updates.requestHeaders["expo-channel-name"] = "production";
  await writeFile(configPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");

  return {
    configPath,
    configType: "app.json",
    prepared: true,
    status: "updated_static",
  };
}

async function prepareStaticCodeConfigForProduction(
  configPath: string,
  configType: "app.config.ts" | "app.config.js",
): Promise<PreparedExpoConfig> {
  const contents = await readFile(configPath, "utf8");

  if (!contents.includes("expo-channel-name")) {
    throw new Error(`Expected expo-channel-name in ${configPath}`);
  }

  const staticChannelPattern =
    /((["'])expo-channel-name\2\s*:\s*)(["'])([^"'\\]*(?:\\.[^"'\\]*)*)\3/m;
  const match = contents.match(staticChannelPattern);

  if (!match) {
    return {
      configPath,
      configType,
      prepared: false,
      status: "skipped_dynamic",
    };
  }

  const prefix = match[1] ?? "";
  const quote = match[3] ?? '"';
  const currentChannel = match[4] ?? "";

  if (currentChannel === "production") {
    return {
      configPath,
      configType,
      prepared: false,
      status: "already_production",
    };
  }

  const nextContents = contents.replace(
    staticChannelPattern,
    `${prefix}${quote}production${quote}`,
  );
  await writeFile(configPath, nextContents, "utf8");

  return {
    configPath,
    configType,
    prepared: true,
    status: "updated_static",
  };
}

export async function prepareExpoProductionConfig({
  projectRoot,
}: {
  projectRoot: string;
}): Promise<PreparedExpoConfig> {
  const configPath = await findExpoConfigPath(projectRoot);
  const configType = getExpoConfigType(configPath);

  if (configType === "app.json") {
    return prepareAppJsonForProduction(configPath);
  }

  return prepareStaticCodeConfigForProduction(configPath, configType);
}

export async function restoreExpoChannelFromRef({
  headRef,
  projectRoot,
  repoRoot,
}: {
  headRef: string;
  projectRoot: string;
  repoRoot: string;
}): Promise<RestoredExpoChannel> {
  const configPath = await findExpoConfigPath(projectRoot);
  const configType = getExpoConfigType(configPath);
  const originalContents = readConfigAtRef(repoRoot, headRef, projectRoot, configType);

  if (configType === "app.json") {
    const current = JSON.parse(await readFile(configPath, "utf8")) as {
      expo?: {
        updates?: {
          requestHeaders?: Record<string, string | undefined>;
        };
      };
    };
    const original = JSON.parse(originalContents) as {
      expo?: {
        updates?: {
          requestHeaders?: Record<string, string | undefined>;
        };
      };
    };
    const originalChannel = original.expo?.updates?.requestHeaders?.["expo-channel-name"];

    if (!originalChannel) {
      throw new Error(`Expected expo-channel-name in ${configPath} at ${headRef}`);
    }

    current.expo ??= {};
    current.expo.updates ??= {};
    current.expo.updates.requestHeaders ??= {};
    current.expo.updates.requestHeaders["expo-channel-name"] = originalChannel;
    await writeFile(configPath, `${JSON.stringify(current, null, 2)}\n`, "utf8");

    return {
      configPath,
      configType,
      restored: true,
      status: "restored_static",
    };
  }

  const staticChannelPattern =
    /((["'])expo-channel-name\2\s*:\s*)(["'])([^"'\\]*(?:\\.[^"'\\]*)*)\3/m;
  const currentContents = await readFile(configPath, "utf8");
  const originalMatch = originalContents.match(staticChannelPattern);

  if (!originalMatch) {
    return {
      configPath,
      configType,
      restored: false,
      status: "skipped_dynamic",
    };
  }

  const prefix = originalMatch[1] ?? "";
  const quote = originalMatch[3] ?? '"';
  const originalChannel = originalMatch[4] ?? "";
  const nextContents = currentContents.replace(
    staticChannelPattern,
    `${prefix}${quote}${originalChannel}${quote}`,
  );
  await writeFile(configPath, nextContents, "utf8");

  return {
    configPath,
    configType,
    restored: true,
    status: "restored_static",
  };
}

export async function resolveExpoFingerprintMetadata({
  profile,
  projectRoot,
  ref,
}: {
  profile?: FingerprintProfile;
  projectRoot: string;
  ref?: string;
}): Promise<ResolvedExpoConfig> {
  const normalizedRef = normalizeRef(ref);
  const resolvedProfile = profile ?? inferFingerprintProfile(normalizedRef);
  const configPath = await findExpoConfigPath(projectRoot);
  return withExpoBuildProfile(resolvedProfile, async () => {
    const { staticConfigPath, dynamicConfigPath } = getConfigFilePaths(projectRoot);
    const config = getConfig(projectRoot, {
      skipSDKVersionRequirement: true,
    });
    const channel = config.exp.updates?.requestHeaders?.["expo-channel-name"];
    const version = config.exp.version;
    const buildNumber = config.exp.ios?.buildNumber;
    const versionCode = config.exp.android?.versionCode;

    if (!channel) {
      throw new Error(`Expected expo-channel-name in ${configPath}`);
    }

    if (!version) {
      throw new Error(`Expected expo.version in ${configPath}`);
    }

    if (!buildNumber) {
      throw new Error(`Expected expo.ios.buildNumber in ${configPath}`);
    }

    if (typeof versionCode !== "number") {
      throw new Error(`Expected expo.android.versionCode in ${configPath}`);
    }

    return {
      android: {
        versionCode,
      },
      channel,
      configPath: dynamicConfigPath || staticConfigPath || configPath,
      ios: {
        buildNumber,
      },
      profile: resolvedProfile,
      previewChannel: resolvedProfile === "preview" ? normalizedRef : undefined,
      ref: normalizedRef,
      version,
    };
  });
}
