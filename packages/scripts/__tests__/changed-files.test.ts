import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { getChangedFiles } from "../src/changed-files.js";

describe("getChangedFiles", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "changed-files-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("fails clearly when git commands cannot be executed", async () => {
    await expect(
      getChangedFiles({
        cwd: tempDir,
      }),
    ).rejects.toThrow('Failed to run "git diff --name-only HEAD"');
  });
});
