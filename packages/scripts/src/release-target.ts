import { pathExistsAtRef, readFileAtRef } from "./git.js";

type PackageJson = {
  main?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  name?: string;
  peerDependencies?: Record<string, string>;
};

export type ReleaseTargetClassification = {
  reason: string;
  tagKind: "" | "app" | "package";
  targetName: string;
  targetPath: string;
  targetType: "" | "cloudflare" | "mobile";
  valid: boolean;
};

const WRANGLER_FILES = ["wrangler.jsonc", "wrangler.json", "wrangler.toml"];
const RELEASE_TAG_PATTERN = /^(app|package)-(.+)@([^@]+)$/;

function hasWranglerConfigAtRef(repoRoot: string, ref: string, appPath: string): boolean {
  return WRANGLER_FILES.some((fileName) => pathExistsAtRef(repoRoot, ref, `${appPath}/${fileName}`));
}

function hasExpoDependencyAtRef(repoRoot: string, ref: string, appPath: string): boolean {
  const contents = readFileAtRef(repoRoot, ref, `${appPath}/package.json`);
  if (!contents) {
    return false;
  }

  try {
    const packageJson = JSON.parse(contents) as PackageJson;
    const dependencyNames = new Set([
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
      ...Object.keys(packageJson.peerDependencies ?? {}),
    ]);

    return dependencyNames.has("expo") || packageJson.main === "expo-router/entry";
  } catch {
    return false;
  }
}

export async function classifyReleaseTarget({
  headRef,
  repoRoot,
  tagName,
}: {
  headRef: string;
  repoRoot: string;
  tagName: string;
}): Promise<ReleaseTargetClassification> {
  const match = RELEASE_TAG_PATTERN.exec(tagName);
  if (!match) {
    return {
      reason:
        "Release tag must match app-<name>@<version> or package-<name>@<version>.",
      tagKind: "",
      targetName: "",
      targetPath: "",
      targetType: "",
      valid: false,
    };
  }

  const tagKind = match[1] as "app" | "package";
  const targetName = match[2] ?? "";

  if (tagKind === "package") {
    return {
      reason: "Package releases are not deployable yet.",
      tagKind,
      targetName,
      targetPath: `packages/${targetName}`,
      targetType: "",
      valid: false,
    };
  }

  const targetPath = `apps/${targetName}`;
  const packageJsonPath = `${targetPath}/package.json`;
  if (!pathExistsAtRef(repoRoot, headRef, packageJsonPath)) {
    return {
      reason: `Release tag app-${targetName} does not match an existing app at ${targetPath}.`,
      tagKind,
      targetName,
      targetPath,
      targetType: "",
      valid: false,
    };
  }

  if (hasWranglerConfigAtRef(repoRoot, headRef, targetPath)) {
    return {
      reason: "Resolved app is Wrangler-backed and deploys through Cloudflare production.",
      tagKind,
      targetName,
      targetPath,
      targetType: "cloudflare",
      valid: true,
    };
  }

  if (hasExpoDependencyAtRef(repoRoot, headRef, targetPath)) {
    return {
      reason: "Resolved app includes Expo and deploys through mobile production.",
      tagKind,
      targetName,
      targetPath,
      targetType: "mobile",
      valid: true,
    };
  }

  return {
    reason: `Resolved app at ${targetPath} is neither a Cloudflare app nor an Expo app.`,
    tagKind,
    targetName,
    targetPath,
    targetType: "",
    valid: false,
  };
}
