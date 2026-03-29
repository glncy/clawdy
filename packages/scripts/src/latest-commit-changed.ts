import { getChangedFilesAtRef } from "./git.js";
import { matchesPatterns } from "./change-matching.js";

type LatestCommitChangedOptions = {
  event: string;
  fetchImpl?: typeof fetch;
  getChangedFilesAtRefImpl?: typeof getChangedFilesAtRef;
  githubToken?: string;
  headSha?: string;
  include: string[];
  owner?: string;
  pullNumber?: string;
  repo?: string;
  repoRoot?: string;
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
}: Omit<LatestCommitChangedOptions, "include"> & { fetchImpl: typeof fetch }): Promise<string> {
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

export async function latestCommitChanged({
  event,
  fetchImpl = fetch,
  getChangedFilesAtRefImpl = getChangedFilesAtRef,
  githubToken,
  headSha,
  include,
  owner,
  pullNumber,
  repo,
  repoRoot,
}: LatestCommitChangedOptions): Promise<boolean> {
  const resolvedHeadSha = await resolveHeadSha({
    event,
    fetchImpl,
    githubToken,
    headSha,
    owner,
    pullNumber,
    repo,
  });

  if (!resolvedHeadSha || !owner || !repo || include.length === 0) {
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
    if (event !== "push" || !repoRoot) {
      throw error;
    }

    changedFiles = getChangedFilesAtRefImpl(repoRoot, resolvedHeadSha);
  }

  return changedFiles.some((file) => matchesPatterns(file, include));
}
