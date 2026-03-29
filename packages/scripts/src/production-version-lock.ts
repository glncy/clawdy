import { execFileSync } from "node:child_process";

import { resolveExpoFingerprintMetadata } from "./expo-config.js";
import { inspectFingerprints } from "./fingerprint.js";

type PackageJson = {
  version?: string;
};

export type ProductionVersionLockState = "locked_match" | "locked_mismatch" | "unlocked";

export type ProductionVersionLockResult = {
  expoVersion: string;
  packageVersion: string;
  productionVersionExists: boolean;
  reason: string;
  state: ProductionVersionLockState;
  version: string;
  versionMatches: boolean;
};

export function readPackageVersionAtRef(repoRoot: string, ref: string, appPath: string): string {
  try {
    const contents = execFileSync("git", ["cat-file", "-p", `${ref}:${appPath}/package.json`], {
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

export async function determineProductionVersionLock({
  appPath,
  headRef,
  inspectFingerprintsImpl = inspectFingerprints,
  readPackageVersionAtRefImpl = readPackageVersionAtRef,
  ref = headRef,
  repoRoot,
  resolveExpoMetadataImpl = resolveExpoFingerprintMetadata,
  targetVersion,
}: {
  appPath: string;
  headRef: string;
  inspectFingerprintsImpl?: typeof inspectFingerprints;
  readPackageVersionAtRefImpl?: typeof readPackageVersionAtRef;
  ref?: string;
  repoRoot: string;
  resolveExpoMetadataImpl?: typeof resolveExpoFingerprintMetadata;
  targetVersion?: string;
}): Promise<ProductionVersionLockResult> {
  const packageVersion = readPackageVersionAtRefImpl(repoRoot, headRef, appPath);
  const expoMetadata = await resolveExpoMetadataImpl({
    profile: "production",
    projectRoot: `${repoRoot}/${appPath}`,
    ref,
  });
  const expoVersion = expoMetadata.version;
  const versionMatches =
    packageVersion !== "" &&
    expoVersion !== "" &&
    packageVersion === expoVersion &&
    (targetVersion === undefined || targetVersion === packageVersion);
  const version = targetVersion ?? (versionMatches ? packageVersion : packageVersion || expoVersion);

  if (!version) {
    return {
      expoVersion,
      packageVersion,
      productionVersionExists: false,
      reason: "The app version could not be resolved for production lock evaluation.",
      state: "unlocked",
      version: "",
      versionMatches,
    };
  }

  const fingerprintResult = await inspectFingerprintsImpl({
    outputDir: `${repoRoot}/${appPath}/fingerprints`,
    profile: "production",
    projectRoot: `${repoRoot}/${appPath}`,
    ref,
    repoRoot,
  });

  const currentAndroidEntry = fingerprintResult.history.android[fingerprintResult.current.android];
  const currentIosEntry = fingerprintResult.history.ios[fingerprintResult.current.ios];
  const productionVersionExists =
    Object.values(fingerprintResult.history.android).some(
      (entry) => entry.profile === "production" && entry.version === version,
    ) ||
    Object.values(fingerprintResult.history.ios).some(
      (entry) => entry.profile === "production" && entry.version === version,
    );

  if (!productionVersionExists) {
    return {
      expoVersion,
      packageVersion,
      productionVersionExists: false,
      reason: `Production fingerprint history does not contain version ${version}.`,
      state: "unlocked",
      version,
      versionMatches,
    };
  }

  const currentFingerprintMatchesProduction =
    currentAndroidEntry?.profile === "production" &&
    currentAndroidEntry.version === version &&
    currentIosEntry?.profile === "production" &&
    currentIosEntry.version === version;

  if (currentFingerprintMatchesProduction) {
    return {
      expoVersion,
      packageVersion,
      productionVersionExists: true,
      reason: `Version ${version} already has a matching production fingerprint.`,
      state: "locked_match",
      version,
      versionMatches,
    };
  }

  return {
    expoVersion,
    packageVersion,
    productionVersionExists: true,
    reason: `Version ${version} already has a production fingerprint, but the current production-shaped fingerprint does not match it.`,
    state: "locked_mismatch",
    version,
    versionMatches,
  };
}
