import { latestCommitChanged } from "../src/latest-commit-changed.js";

describe("latestCommitChanged", () => {
  it("returns true when the latest PR head commit changes a matching fingerprint file", async () => {
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);

      if (url.endsWith("/pulls/30")) {
        return new Response(
          JSON.stringify({
            head: {
              sha: "pr-head-sha",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.endsWith("/commits/pr-head-sha")) {
        return new Response(
          JSON.stringify({
            files: [
              { filename: "apps/mobile/fingerprints/ios.json" },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      throw new Error(`Unexpected URL: ${url}`);
    };

    await expect(
      latestCommitChanged({
        event: "pull_request",
        fetchImpl,
        include: ["apps/mobile/fingerprints/*.json"],
        owner: "example-org",
        pullNumber: "30",
        repo: "starter-repo",
      }),
    ).resolves.toBe(true);
  });

  it("returns false when the latest PR head commit changes no matching files", async () => {
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);

      if (url.endsWith("/pulls/30")) {
        return new Response(
          JSON.stringify({
            head: {
              sha: "pr-head-sha",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.endsWith("/commits/pr-head-sha")) {
        return new Response(
          JSON.stringify({
            files: [
              { filename: "apps/mobile/src/app.tsx" },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      throw new Error(`Unexpected URL: ${url}`);
    };

    await expect(
      latestCommitChanged({
        event: "pull_request",
        fetchImpl,
        include: ["apps/mobile/fingerprints/*.json"],
        owner: "example-org",
        pullNumber: "30",
        repo: "starter-repo",
      }),
    ).resolves.toBe(false);
  });

  it("returns true when the latest push commit changes a matching fingerprint file", async () => {
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);

      if (url.endsWith("/commits/push-head-sha")) {
        return new Response(
          JSON.stringify({
            files: [
              { filename: "apps/mobile/fingerprints/android.json" },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      throw new Error(`Unexpected URL: ${url}`);
    };

    await expect(
      latestCommitChanged({
        event: "push",
        fetchImpl,
        headSha: "push-head-sha",
        include: ["apps/mobile/fingerprints/*.json"],
        owner: "example-org",
        repo: "starter-repo",
      }),
    ).resolves.toBe(true);
  });

  it("falls back to local git changed files when the push commit API returns 404", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response("not found", { status: 404, statusText: "Not Found" });

    await expect(
      latestCommitChanged({
        event: "push",
        fetchImpl,
        getChangedFilesAtRefImpl: () => ["apps/mobile/fingerprints/android.json"],
        headSha: "push-head-sha",
        include: ["apps/mobile/fingerprints/*.json"],
        owner: "example-org",
        repo: "starter-repo",
        repoRoot: "/repo",
      }),
    ).resolves.toBe(true);
  });
});
