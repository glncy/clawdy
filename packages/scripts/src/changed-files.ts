import { execSync } from "node:child_process";

type ChangedFilesOptions = {
  base?: string;
  cwd: string;
};

function readGitCommand(command: string, cwd: string): string[] {
  try {
    const output = execSync(command, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    return output.split("\n").filter(Boolean);
  } catch (error) {
    throw new Error(`Failed to run "${command}" in ${cwd}`, {
      cause: error,
    });
  }
}

export async function getChangedFiles({
  base,
  cwd,
}: ChangedFilesOptions): Promise<string[]> {
  const changedFiles = new Set<string>();

  if (base) {
    for (const file of readGitCommand(`git diff --name-only ${base}...HEAD`, cwd)) {
      changedFiles.add(file);
    }
  }

  for (const file of readGitCommand("git diff --name-only HEAD", cwd)) {
    changedFiles.add(file);
  }

  for (const file of readGitCommand("git diff --name-only --cached", cwd)) {
    changedFiles.add(file);
  }

  for (const file of readGitCommand("git ls-files --others --exclude-standard", cwd)) {
    changedFiles.add(file);
  }

  return [...changedFiles];
}
