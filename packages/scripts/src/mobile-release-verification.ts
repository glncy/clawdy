import { resolveExpoFingerprintMetadata } from "./expo-config.js";
import { readPackageVersionAtRef } from "./production-version-lock.js";

export type MobileReleaseVerificationResult = {
  expoVersion: string;
  headRef: string;
  packageVersion: string;
  releaseChannel: string;
  valid: boolean;
  versionMatches: boolean;
};

export async function verifyMobileRelease({
  appPath,
  headRef,
  releaseChannel,
  repoRoot,
  resolveExpoMetadataImpl = resolveExpoFingerprintMetadata,
  readPackageVersionAtRefImpl = readPackageVersionAtRef,
}: {
  appPath: string;
  headRef: string;
  releaseChannel: string;
  repoRoot: string;
  resolveExpoMetadataImpl?: typeof resolveExpoFingerprintMetadata;
  readPackageVersionAtRefImpl?: typeof readPackageVersionAtRef;
}): Promise<MobileReleaseVerificationResult> {
  const normalizedChannel = releaseChannel.trim();
  const packageVersion = readPackageVersionAtRefImpl(repoRoot, headRef, appPath);
  const expoMetadata = await resolveExpoMetadataImpl({
    projectRoot: `${repoRoot}/${appPath}`,
    ref: headRef,
  });
  const expoVersion = expoMetadata.version;
  const versionMatches =
    packageVersion !== "" &&
    expoVersion !== "" &&
    packageVersion === expoVersion;

  return {
    expoVersion,
    headRef,
    packageVersion,
    releaseChannel: normalizedChannel,
    valid: normalizedChannel !== "" && versionMatches,
    versionMatches,
  };
}
