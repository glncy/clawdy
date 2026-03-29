import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

import { createProjectHashAsync } from "@expo/fingerprint";
import {
  inferFingerprintProfile,
  resolveExpoFingerprintMetadata,
  withExpoBuildProfile,
} from "./expo-config.js";

export const HASH_ALGORITHM = "sha1";
export const FINGERPRINT_DIRECTORY_NAME = "fingerprints";

const PLATFORM_OUTPUT_FILES = {
  android: "android.json",
  ios: "ios.json",
} as const;

type Platform = keyof typeof PLATFORM_OUTPUT_FILES;

type CreateProjectHash = typeof createProjectHashAsync;
export type { CreateProjectHash };

type AndroidFingerprintEntry = {
  channel: string;
  createdAt: string;
  profile: "internal" | "preview" | "production";
  previewChannel?: string;
  ref: string;
  version: string;
  versionCode: number;
};

type IosFingerprintEntry = {
  buildNumber: string;
  channel: string;
  createdAt: string;
  profile: "internal" | "preview" | "production";
  previewChannel?: string;
  ref: string;
  version: string;
};

type FingerprintEntryMap = {
  android: AndroidFingerprintEntry;
  ios: IosFingerprintEntry;
};

type FingerprintHistoryMap = {
  android: Record<string, AndroidFingerprintEntry>;
  ios: Record<string, IosFingerprintEntry>;
};

type FingerprintHistoryForPlatform<TPlatform extends Platform> =
  FingerprintHistoryMap[TPlatform];

type FingerprintOptions = {
  metadata?: FingerprintEntryMap;
  now?: Date;
  outputDir: string;
  profile?: "internal" | "preview" | "production";
  projectRoot: string;
  ref?: string;
  repoRoot?: string;
  createProjectHash?: CreateProjectHash;
};

type FingerprintMap = Record<Platform, string>;

type FingerprintInspectionResult = {
  current: FingerprintMap;
  history: FingerprintHistoryMap;
  missing: Record<Platform, boolean>;
};

type FingerprintGenerateResult = FingerprintInspectionResult & {
  added: Record<Platform, boolean>;
};

export class FingerprintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FingerprintError";
  }
}

async function calculatePlatformHash(
  projectRoot: string,
  platform: Platform,
  createHash: CreateProjectHash,
): Promise<string> {
  return createHash(projectRoot, {
    hashAlgorithm: HASH_ALGORITHM,
    platforms: [platform],
    silent: true,
  });
}

function emptyHistoryForPlatform<TPlatform extends Platform>(
  _platform: TPlatform,
): FingerprintHistoryForPlatform<TPlatform> {
  return {} as FingerprintHistoryForPlatform<TPlatform>;
}

function filePathForPlatform(outputDir: string, platform: Platform): string {
  return `${outputDir}/${PLATFORM_OUTPUT_FILES[platform]}`;
}

function sortHistoryEntries<T>(history: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(history).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function normalizeMetadataEntries(metadata: FingerprintEntryMap): FingerprintEntryMap {
  return {
    android: {
      version: metadata.android.version,
      versionCode: metadata.android.versionCode,
      profile: metadata.android.profile,
      previewChannel: metadata.android.previewChannel,
      ref: metadata.android.ref,
      channel: metadata.android.channel,
      createdAt: metadata.android.createdAt,
    },
    ios: {
      version: metadata.ios.version,
      buildNumber: metadata.ios.buildNumber,
      profile: metadata.ios.profile,
      previewChannel: metadata.ios.previewChannel,
      ref: metadata.ios.ref,
      channel: metadata.ios.channel,
      createdAt: metadata.ios.createdAt,
    },
  };
}

async function readCommittedFingerprintHistory<TPlatform extends Platform>(
  outputDir: string,
  repoRoot: string,
  platform: TPlatform,
): Promise<FingerprintHistoryForPlatform<TPlatform>> {
  const filePath = filePathForPlatform(outputDir, platform);

  try {
    const contents = await readFile(filePath, "utf8");
    return JSON.parse(contents) as FingerprintHistoryForPlatform<TPlatform>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const relativeFilePath = relative(repoRoot, filePath) || filePath;
      throw new FingerprintError(
        `Missing fingerprint file: ${relativeFilePath}`,
      );
    }

    throw error;
  }
}

async function readCommittedFingerprintHistories(
  outputDir: string,
  repoRoot: string,
): Promise<FingerprintHistoryMap> {
  return {
    ios: await readCommittedFingerprintHistory(outputDir, repoRoot, "ios").catch(
      (error) => {
        if (error instanceof FingerprintError) {
          return emptyHistoryForPlatform("ios");
        }
        throw error;
      },
    ),
    android: await readCommittedFingerprintHistory(outputDir, repoRoot, "android").catch(
      (error) => {
        if (error instanceof FingerprintError) {
          return emptyHistoryForPlatform("android");
        }
        throw error;
      },
    ),
  };
}

async function resolveFingerprintMetadata({
  metadata,
  now = new Date(),
  profile,
  projectRoot,
  ref,
}: Pick<FingerprintOptions, "metadata" | "now" | "profile" | "projectRoot" | "ref">): Promise<FingerprintEntryMap> {
  if (metadata) {
    return normalizeMetadataEntries(metadata);
  }

  const resolved = await resolveExpoFingerprintMetadata({
    profile,
    projectRoot,
    ref,
  });

  return normalizeMetadataEntries({
    android: {
      channel: resolved.channel,
      createdAt: now.toISOString(),
      profile: resolved.profile,
      previewChannel: resolved.previewChannel,
      ref: resolved.ref,
      version: resolved.version,
      versionCode: resolved.android.versionCode,
    },
    ios: {
      buildNumber: resolved.ios.buildNumber,
      channel: resolved.channel,
      createdAt: now.toISOString(),
      profile: resolved.profile,
      previewChannel: resolved.previewChannel,
      ref: resolved.ref,
      version: resolved.version,
    },
  });
}

export async function inspectFingerprints({
  outputDir,
  createProjectHash: createHash = createProjectHashAsync,
  profile,
  projectRoot,
  ref,
  repoRoot = projectRoot,
}: FingerprintOptions): Promise<FingerprintInspectionResult> {
  const resolvedProfile = profile ?? inferFingerprintProfile(ref);
  const history = {
    ios: await readCommittedFingerprintHistory(outputDir, repoRoot, "ios"),
    android: await readCommittedFingerprintHistory(outputDir, repoRoot, "android"),
  } satisfies FingerprintHistoryMap;

  const current = await withExpoBuildProfile(resolvedProfile, async () => ({
    ios: await calculatePlatformHash(projectRoot, "ios", createHash),
    android: await calculatePlatformHash(projectRoot, "android", createHash),
  })) satisfies FingerprintMap;

  return {
    current,
    history,
    missing: {
      android: !history.android[current.android],
      ios: !history.ios[current.ios],
    },
  };
}

export function getFingerprintPaths(projectRoot: string, repoRoot: string) {
  const resolvedProjectRoot = resolve(projectRoot);
  const resolvedRepoRoot = resolve(repoRoot);
  const outputDir = join(resolvedProjectRoot, FINGERPRINT_DIRECTORY_NAME);

  return {
    outputDir,
    projectRoot: resolvedProjectRoot,
    relativeOutputDir:
      relative(resolvedRepoRoot, outputDir) || FINGERPRINT_DIRECTORY_NAME,
  };
}

export async function generateFingerprints({
  metadata,
  now,
  outputDir,
  profile,
  projectRoot,
  ref,
  createProjectHash: createHash = createProjectHashAsync,
}: FingerprintOptions): Promise<FingerprintGenerateResult> {
  await mkdir(outputDir, { recursive: true });
  const resolvedProfile = profile ?? inferFingerprintProfile(ref);

  const current = await withExpoBuildProfile(resolvedProfile, async () => ({
    ios: await calculatePlatformHash(projectRoot, "ios", createHash),
    android: await calculatePlatformHash(projectRoot, "android", createHash),
  })) satisfies FingerprintMap;

  const fingerprintMetadata = await resolveFingerprintMetadata({
    metadata,
    now,
    profile: resolvedProfile,
    projectRoot,
    ref,
  });

  const histories = await readCommittedFingerprintHistories(outputDir, projectRoot);

  const added: Record<Platform, boolean> = {
    android: false,
    ios: false,
  };

  for (const platform of Object.keys(current) as Platform[]) {
    const hash = current[platform];
    if (platform === "ios") {
      if (!histories.ios[hash]) {
        histories.ios[hash] = fingerprintMetadata.ios;
        added.ios = true;
      }
      continue;
    }

    if (!histories.android[hash]) {
      histories.android[hash] = fingerprintMetadata.android;
      added.android = true;
    }
  }

  await Promise.all([
    writeFile(
      filePathForPlatform(outputDir, "ios"),
      `${JSON.stringify(sortHistoryEntries(histories.ios), null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      filePathForPlatform(outputDir, "android"),
      `${JSON.stringify(sortHistoryEntries(histories.android), null, 2)}\n`,
      "utf8",
    ),
  ]);

  return {
    added,
    current,
    history: histories,
    missing: {
      android: false,
      ios: false,
    },
  };
}

export async function compareFingerprints({
  outputDir,
  createProjectHash: createHash = createProjectHashAsync,
  profile,
  projectRoot,
  ref,
  repoRoot = projectRoot,
}: FingerprintOptions): Promise<FingerprintInspectionResult> {
  const result = await inspectFingerprints({
    outputDir,
    createProjectHash: createHash,
    profile,
    projectRoot,
    ref,
    repoRoot,
  });

  for (const platform of Object.keys(result.current) as Platform[]) {
    if (result.missing[platform]) {
      throw new FingerprintError(
        `Fingerprint history missing hash for ${platform}: ${result.current[platform]}`,
      );
    }
  }

  return result;
}
