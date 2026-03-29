import { getChangedFilesAtRef } from "./git.js";
import { depsChange } from "./deps-change.js";

type LatestCommitDepsChangedOptions = {
  event: string;
  fetchImpl?: typeof fetch;
  getChangedFilesAtRefImpl?: typeof getChangedFilesAtRef;
  githubToken?: string;
  headSha?: string;
  owner?: string;
  pullNumber?: string;
  repo?: string;
  repoRoot: string;
  verbose?: boolean;
};

type PullResponse = {
  head?: {
    sha?: string;
  };
};

type CommitResponse = {
  files?: Array<{
    filename?: string;
  }>;
};

async function fetchGitHubJson<T>(
  url: string,
  fetchImpl: typeof fetch,
  githubToken?: string,
): Promise<T> {
  const response = await fetchImpl(url, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function resolveHeadSha({
  event,
  fetchImpl,
  githubToken,
  headSha,
  owner,
  pullNumber,
  repo,
}: Omit<LatestCommitDepsChangedOptions, "repoRoot" | "verbose"> & {
  fetchImpl: typeof fetch;
}): Promise<string> {
  if (event === "pull_request") {
    if (!owner || !repo || !pullNumber) {
      return "";
    }

    const pull = await fetchGitHubJson<PullResponse>(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
      fetchImpl,
      githubToken,
    );

    return pull.head?.sha ?? "";
  }

  return headSha ?? "";
}

export async function latestCommitDepsChanged(
  targetPath: string,
  {
    event,
    fetchImpl = fetch,
    getChangedFilesAtRefImpl = getChangedFilesAtRef,
    githubToken,
    headSha,
    owner,
    pullNumber,
    repo,
    repoRoot,
    verbose,
  }: LatestCommitDepsChangedOptions,
): Promise<boolean> {
  const resolvedHeadSha = await resolveHeadSha({
    event,
    fetchImpl,
    githubToken,
    headSha,
    owner,
    pullNumber,
    repo,
  });

  if (!resolvedHeadSha || !owner || !repo) {
    return false;
  }

  let changedFiles: string[] = [];

  try {
    const commit = await fetchGitHubJson<CommitResponse>(
      `https://api.github.com/repos/${owner}/${repo}/commits/${resolvedHeadSha}`,
      fetchImpl,
      githubToken,
    );

    changedFiles = (commit.files ?? []).flatMap((file) => (file.filename ? [file.filename] : []));
  } catch (error) {
    if (event !== "push") {
      throw error;
    }

    changedFiles = getChangedFilesAtRefImpl(repoRoot, resolvedHeadSha);
  }

  return depsChange(targetPath, {
    getChangedFiles: async () => changedFiles,
    repoRoot,
    verbose,
  });
}
