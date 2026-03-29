import { execSync } from "node:child_process";

type ResolveComparisonBaseOptions = {
  cwd: string;
  event: string;
  fetchImpl?: typeof fetch;
  githubToken?: string;
  owner?: string;
  pullNumber?: string;
  repo?: string;
};

function readGitOutput(command: string, cwd: string): string {
  try {
    return execSync(command, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

export async function resolveComparisonBase({
  cwd,
  event,
  fetchImpl = fetch,
  githubToken,
  owner,
  pullNumber,
  repo,
}: ResolveComparisonBaseOptions): Promise<string> {
  if (event === "pull_request") {
    if (!owner || !repo || !pullNumber) {
      return "";
    }

    const response = await fetchImpl(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to resolve PR base SHA for ${owner}/${repo}#${pullNumber}: ${response.status} ${response.statusText}`,
      );
    }

    const payload = (await response.json()) as {
      base?: {
        sha?: string;
      };
    };

    return payload.base?.sha ?? "";
  }

  return readGitOutput("git rev-parse HEAD^", cwd);
}
