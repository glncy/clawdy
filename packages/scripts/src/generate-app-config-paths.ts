#!/usr/bin/env bun

import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDir, "../../..");
const appsDir = join(repoRoot, "apps");
const outputDir = join(repoRoot, "packages/scripts/src/generated");
const outputFile = join(outputDir, "app-config-paths.d.ts");

async function main() {
  const entries = await readdir(appsDir, { withFileTypes: true });
  const appPaths = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => `apps/${entry.name}`)
    .sort();

  const contents = `export type AppConfigPath =
${appPaths.map((appPath) => `  | "${appPath}"`).join("\n")};
`;

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, contents, "utf8");
  console.log(`Generated ${outputFile}`);
}

main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Failed to generate app config paths.",
  );
  process.exit(1);
});
