import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { loadProjectConfig } from "../src/project-config.js";

describe("scripts config", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "project-config-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("loads deps-change and should-run rules from scripts.config.ts", async () => {
    await writeFile(
      join(tempDir, "scripts.config.ts"),
      `const config = {
  "should-run": {
    build: {
      exclude: ["**/*.md"],
    },
    lint: {
      exclude: ["**/*.md"],
    },
  },
};

export default config;
`,
      "utf8",
    );

    await expect(loadProjectConfig(tempDir)).resolves.toEqual({
      "should-run": {
        build: {
          exclude: ["**/*.md"],
        },
        lint: {
          exclude: ["**/*.md"],
        },
      },
    });
  });

  it("fails clearly when scripts.config.ts is missing", async () => {
    await expect(loadProjectConfig(tempDir)).rejects.toThrow(
      "Could not read scripts config at",
    );
  });

  it("fails clearly when scripts.config.ts is invalid", async () => {
    await writeFile(
      join(tempDir, "scripts.config.ts"),
      "export default { broken: ;",
      "utf8",
    );

    await expect(loadProjectConfig(tempDir)).rejects.toThrow(
      "Could not load scripts config at",
    );
  });
});
