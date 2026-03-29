import { getChangedFiles as getChangedFilesFromGit } from "./changed-files.js";
import { matchesPatterns } from "./change-matching.js";
import { loadProjectConfig } from "./project-config.js";

type ShouldRunOptions = {
  base?: string;
  getChangedFiles?: () => Promise<string[]>;
  repoRoot: string;
  verbose?: boolean;
};

export async function shouldRun(
  rule: string,
  { base, getChangedFiles, repoRoot, verbose }: ShouldRunOptions,
): Promise<boolean> {
  const config = await loadProjectConfig(repoRoot);
  const ruleConfig = config["should-run"]?.[rule];

  if (!ruleConfig) {
    throw new Error(`Unknown should-run rule: "${rule}"`);
  }

  const changedFiles = getChangedFiles
    ? await getChangedFiles()
    : await getChangedFilesFromGit({ base, cwd: repoRoot });

  if (changedFiles.length === 0) {
    return false;
  }

  const includePatterns = ruleConfig.include ?? [];
  const excludePatterns = ruleConfig.exclude ?? [];

  for (const file of changedFiles) {
    if (includePatterns.length > 0 && !matchesPatterns(file, includePatterns)) {
      continue;
    }

    if (!matchesPatterns(file, excludePatterns)) {
      if (verbose) {
        console.error(`should-run match: ${file}`);
      }
      return true;
    }
  }

  return false;
}
