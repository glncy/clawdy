import { execFileSync } from "node:child_process";

import { resolveExpoFingerprintMetadata } from "./expo-config.js";
import { inspectFingerprints } from "./fingerprint.js";
import {
  determineProductionVersionLock,
  readPackageVersionAtRef,
} from "./production-version-lock.js";

export type MobileProductionActionResult = {
  action: "build" | "fail" | "release";
  androidFingerprintChanged: boolean;
  iosFingerprintChanged: boolean;
  packageVersionChanged: boolean;
  reason: string;
  runAndroidBuild: boolean;
  runIosBuild: boolean;
  runReleaseUpdate: boolean;
};

function getVersionFromReleaseTag(ref?: string): string | null {
  const match = ref?.match(/^app-.+@(\d+\.\d+\.\d+)/);
  const taggedVersion = match?.[1];
  if (!taggedVersion) {
    return null;
  }

  return taggedVersion;
}

function didPackageVersionChange({
  currentPackageVersion,
  previousPackageVersion,
  ref,
}: {
  currentPackageVersion: string;
  previousPackageVersion?: string;
  ref?: string;
}): boolean {
  const taggedVersion = getVersionFromReleaseTag(ref);
  if (taggedVersion) {
    return currentPackageVersion === taggedVersion;
  }

  return previousPackageVersion !== undefined && previousPackageVersion !== currentPackageVersion;
}

export function mobileProductionPackageVersionChanged({
  appPath,
  headRef,
  ref,
  repoRoot,
}: {
  appPath: string;
  headRef: string;
  ref?: string;
  repoRoot: string;
}): boolean {
  return didPackageVersionChange({
    currentPackageVersion: readPackageVersionAtRef(repoRoot, headRef, appPath),
    previousPackageVersion: readPackageVersionAtRef(repoRoot, `${headRef}^`, appPath),
    ref,
  });
}

export async function determineMobileProductionAction({
  appPath,
  headRef,
  inspectFingerprints: inspectFingerprintsImpl = inspectFingerprints,
  profile = "production",
  readPackageVersionAtRefImpl = readPackageVersionAtRef,
  ref = headRef,
  repoRoot,
  resolveExpoMetadataImpl = resolveExpoFingerprintMetadata,
}: {
  appPath: string;
  headRef: string;
  inspectFingerprints?: typeof inspectFingerprints;
  profile?: "internal" | "preview" | "production";
  readPackageVersionAtRefImpl?: typeof readPackageVersionAtRef;
  ref?: string;
  repoRoot: string;
  resolveExpoMetadataImpl?: typeof resolveExpoFingerprintMetadata;
}): Promise<MobileProductionActionResult> {
  const fingerprintResult = await inspectFingerprintsImpl({
    outputDir: `${repoRoot}/${appPath}/fingerprints`,
    profile,
    projectRoot: `${repoRoot}/${appPath}`,
    ref,
    repoRoot,
  });

  const androidFingerprintChanged = fingerprintResult.missing.android;
  const iosFingerprintChanged = fingerprintResult.missing.ios;
  const releaseVersion = getVersionFromReleaseTag(ref);
  const packageVersion = readPackageVersionAtRefImpl(repoRoot, headRef, appPath);
  const expoMetadata = await resolveExpoMetadataImpl({
    profile,
    projectRoot: `${repoRoot}/${appPath}`,
    ref,
  });
  const expoVersion = expoMetadata.version;
  const packageVersionChanged = didPackageVersionChange({
    currentPackageVersion: packageVersion,
    previousPackageVersion: readPackageVersionAtRefImpl(repoRoot, `${headRef}^`, appPath),
    ref,
  });
  const versionMatches =
    releaseVersion !== null &&
    packageVersion === releaseVersion &&
    expoVersion === releaseVersion;
  const productionVersionLock = await determineProductionVersionLock({
    appPath,
    headRef,
    inspectFingerprintsImpl,
    readPackageVersionAtRefImpl,
    ref,
    repoRoot,
    resolveExpoMetadataImpl,
    targetVersion: releaseVersion ?? undefined,
  });

  if (productionVersionLock.state === "locked_match") {
    if (!versionMatches) {
      return {
        action: "fail",
        androidFingerprintChanged,
        iosFingerprintChanged,
        packageVersionChanged,
        reason: `Release version mismatch: tag=${releaseVersion ?? "unknown"}, package.json=${packageVersion || "missing"}, expo=${expoVersion || "missing"}.`,
        runAndroidBuild: false,
        runIosBuild: false,
        runReleaseUpdate: false,
      };
    }

    return {
      action: "release",
      androidFingerprintChanged,
      iosFingerprintChanged,
      packageVersionChanged,
      reason: `Version ${productionVersionLock.version} already has a matching production fingerprint, so only the release update will run.`,
      runAndroidBuild: false,
      runIosBuild: false,
      runReleaseUpdate: true,
    };
  }

  if (productionVersionLock.state === "locked_mismatch") {
    return {
      action: "fail",
      androidFingerprintChanged,
      iosFingerprintChanged,
      packageVersionChanged,
      reason: `Version ${productionVersionLock.version} already has a production fingerprint. The current production fingerprint does not match it, so a new version is required.`,
      runAndroidBuild: false,
      runIosBuild: false,
      runReleaseUpdate: false,
    };
  }

  if (!versionMatches) {
    return {
      action: "fail",
      androidFingerprintChanged,
      iosFingerprintChanged,
      packageVersionChanged,
      reason: `Release version mismatch: tag=${releaseVersion ?? "unknown"}, package.json=${packageVersion || "missing"}, expo=${expoVersion || "missing"}.`,
      runAndroidBuild: false,
      runIosBuild: false,
      runReleaseUpdate: false,
    };
  }

  return {
    action: "build",
    androidFingerprintChanged,
    iosFingerprintChanged,
    packageVersionChanged,
    reason: `The production fingerprint history is missing one or more platform hashes for version ${releaseVersion}, so builds will run for the missing platforms.`,
    runAndroidBuild: androidFingerprintChanged,
    runIosBuild: iosFingerprintChanged,
    runReleaseUpdate: false,
  };
}
