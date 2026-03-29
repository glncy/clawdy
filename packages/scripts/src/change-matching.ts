import { basename } from "node:path";

import { minimatch } from "minimatch";

export function matchesPatterns(file: string, patterns: string[]): boolean {
  return patterns.some((pattern) =>
    minimatch(file, pattern) || minimatch(basename(file), pattern),
  );
}
