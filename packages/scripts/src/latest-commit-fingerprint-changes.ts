import { readFileAtRef } from "./git.js";

type FingerprintEntry = {
  profile?: "internal" | "preview" | "production";
};

type FingerprintHistory = Record<string, FingerprintEntry>;

export type LatestCommitFingerprintChangesResult = {
  androidChanged: boolean;
  androidProductionOnly: boolean;
  iosChanged: boolean;
  iosProductionOnly: boolean;
};

function readFingerprintHistoryAtRef(
  readFileAtRefImpl: typeof readFileAtRef,
  repoRoot: string,
  ref: string,
  path: string,
): FingerprintHistory {
  const contents = readFileAtRefImpl(repoRoot, ref, path);
  if (!contents) {
    return {};
  }

  try {
    return JSON.parse(contents) as FingerprintHistory;
  } catch {
    return {};
  }
}

function summarizePlatformChange(
  readFileAtRefImpl: typeof readFileAtRef,
  repoRoot: string,
  headRef: string,
  path: string,
): { changed: boolean; productionOnly: boolean } {
  const previousHistory = readFingerprintHistoryAtRef(
    readFileAtRefImpl,
    repoRoot,
    `${headRef}^`,
    path,
  );
  const currentHistory = readFingerprintHistoryAtRef(
    readFileAtRefImpl,
    repoRoot,
    headRef,
    path,
  );

  const changedEntries = Object.entries(currentHistory).filter(([hash, entry]) => {
    const previousEntry = previousHistory[hash];
    return JSON.stringify(previousEntry) !== JSON.stringify(entry);
  });
  const removedHashes = Object.keys(previousHistory).filter(
    (hash) => !(hash in currentHistory),
  );

  if (changedEntries.length === 0 && removedHashes.length === 0) {
    return { changed: false, productionOnly: false };
  }

  if (removedHashes.length > 0) {
    return { changed: true, productionOnly: false };
  }

  return {
    changed: true,
    productionOnly: changedEntries.every(([, entry]) => entry.profile === "production"),
  };
}

export async function latestCommitFingerprintChanges({
  androidFingerprintPath,
  headRef,
  iosFingerprintPath,
  readFileAtRefImpl = readFileAtRef,
  repoRoot,
}: {
  androidFingerprintPath: string;
  headRef: string;
  iosFingerprintPath: string;
  readFileAtRefImpl?: typeof readFileAtRef;
  repoRoot: string;
}): Promise<LatestCommitFingerprintChangesResult> {
  const android = summarizePlatformChange(
    readFileAtRefImpl,
    repoRoot,
    headRef,
    androidFingerprintPath,
  );
  const ios = summarizePlatformChange(readFileAtRefImpl, repoRoot, headRef, iosFingerprintPath);

  return {
    androidChanged: android.changed,
    androidProductionOnly: android.productionOnly,
    iosChanged: ios.changed,
    iosProductionOnly: ios.productionOnly,
  };
}
