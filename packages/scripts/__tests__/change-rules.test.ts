import { mkdir, mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { depsChange } from "../src/deps-change.js";
import { shouldRun } from "../src/should-run.js";

describe("change rules", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "change-rules-test-"));

    await mkdir(join(tempDir, "apps/mobile"), { recursive: true });
    await mkdir(join(tempDir, "packages/ui"), { recursive: true });
    await mkdir(join(tempDir, "apps/web"), { recursive: true });
    await mkdir(join(tempDir, "services/shared"), { recursive: true });

    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify(
        {
          private: true,
          workspaces: ["apps/*", "packages/*", "services/*"],
        },
        null,
        2,
      ),
      "utf8",
    );

    await writeFile(
      join(tempDir, "scripts.config.ts"),
      `const config = {
  "should-run": {
    build: {
      exclude: ["docs/**", "**/*.md", "**/*.mdx", "README*", "LICENSE*", ".changeset/**/*.md"],
    },
    lint: {
      exclude: ["docs/**", "**/*.md", "**/*.mdx", "README*", "LICENSE*", ".changeset/**/*.md"],
    },
    "type-check": {
      exclude: ["docs/**", "**/*.md", "**/*.mdx", "README*", "LICENSE*", ".changeset/**/*.md"],
    },
    test: {
      exclude: ["docs/**", "**/*.md", "**/*.mdx", "README*", "LICENSE*", ".changeset/**/*.md"],
    },
  },
};

export default config;
`,
      "utf8",
    );

    await writeFile(
      join(tempDir, "apps/mobile/package.json"),
      JSON.stringify(
        {
          dependencies: {
            "@repo/ui": "workspace:*",
            "@repo/shared": "workspace:*",
          },
          devDependencies: {},
          name: "mobile",
        },
        null,
        2,
      ),
      "utf8",
    );

    await writeFile(
      join(tempDir, "packages/ui/package.json"),
      JSON.stringify(
        {
          name: "@repo/ui",
        },
        null,
        2,
      ),
      "utf8",
    );

    await writeFile(
      join(tempDir, "apps/web/package.json"),
      JSON.stringify(
        {
          name: "web",
        },
        null,
        2,
      ),
      "utf8",
    );

    await writeFile(
      join(tempDir, "services/shared/package.json"),
      JSON.stringify(
        {
          name: "@repo/shared",
        },
        null,
        2,
      ),
      "utf8",
    );
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("returns true when the app itself changes", async () => {
    await expect(
      depsChange("apps/mobile", {
        getChangedFiles: async () => ["apps/mobile/src/app.tsx"],
        repoRoot: tempDir,
      }),
    ).resolves.toBe(true);
  });

  it("returns true when a workspace dependency changes", async () => {
    await expect(
      depsChange("apps/mobile", {
        getChangedFiles: async () => ["packages/ui/src/card.tsx"],
        repoRoot: tempDir,
      }),
    ).resolves.toBe(true);
  });

  it("returns true when a workspace dependency changes under a configured workspace root", async () => {
    await expect(
      depsChange("apps/mobile", {
        getChangedFiles: async () => ["services/shared/src/index.ts"],
        repoRoot: tempDir,
      }),
    ).resolves.toBe(true);
  });

  it("returns false when unrelated files change", async () => {
    await expect(
      depsChange("apps/mobile", {
        getChangedFiles: async () => ["apps/web/src/page.tsx"],
        repoRoot: tempDir,
      }),
    ).resolves.toBe(false);
  });

  it("fails clearly for an invalid deps-change path", async () => {
    await expect(
      depsChange("apps/unknown", {
        getChangedFiles: async () => [],
        repoRoot: tempDir,
      }),
    ).rejects.toThrow('Could not read package.json for deps-change path "apps/unknown"');
  });

  it("returns true when should-run include matches and exclude does not", async () => {
    await expect(
      shouldRun("build", {
        getChangedFiles: async () => ["apps/mobile/src/app.tsx"],
        repoRoot: tempDir,
      }),
    ).resolves.toBe(true);
  });

  it("returns false when all relevant changes are excluded", async () => {
    await expect(
      shouldRun("build", {
        getChangedFiles: async () => ["apps/mobile/README.md"],
        repoRoot: tempDir,
      }),
    ).resolves.toBe(false);
  });

  it("returns false when no files changed", async () => {
    await expect(
      shouldRun("build", {
        getChangedFiles: async () => [],
        repoRoot: tempDir,
      }),
    ).resolves.toBe(false);
  });

  it("returns true for shared package changes under generic should-run rules", async () => {
    await expect(
      shouldRun("type-check", {
        getChangedFiles: async () => ["packages/ui/src/card.tsx"],
        repoRoot: tempDir,
      }),
    ).resolves.toBe(true);
  });

  it("fails clearly for an unknown should-run rule", async () => {
    await expect(
      shouldRun("unknown-rule", {
        getChangedFiles: async () => [],
        repoRoot: tempDir,
      }),
    ).rejects.toThrow('Unknown should-run rule: "unknown-rule"');
  });

  it("returns false for docs changes under docs/", async () => {
    await expect(
      shouldRun("lint", {
        getChangedFiles: async () => ["docs/architecture/release.md"],
        repoRoot: tempDir,
      }),
    ).resolves.toBe(false);
  });

  it("returns false for changeset markdown files", async () => {
    await expect(
      shouldRun("test", {
        getChangedFiles: async () => [".changeset/mobile-release.md"],
        repoRoot: tempDir,
      }),
    ).resolves.toBe(false);
  });

  it("returns true when docs and code changes are mixed", async () => {
    await expect(
      shouldRun("build", {
        getChangedFiles: async () => ["README.md", "apps/mobile/src/app.tsx"],
        repoRoot: tempDir,
      }),
    ).resolves.toBe(true);
  });
});
