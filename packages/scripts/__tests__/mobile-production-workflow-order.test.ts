import { readFile } from "node:fs/promises";

async function readWorkflow() {
  return readFile(
    new URL("../../../.github/workflows/mobile-production-app.yml", import.meta.url),
    "utf8",
  );
}

describe("mobile production workflow order", () => {
  it("prepares production config before action determination without a separate invalid release gate", async () => {
    const workflow = await readWorkflow();

    const failIndex = workflow.indexOf("- name: Fail invalid mobile production release");
    const prepareIndex = workflow.indexOf(
      "- name: Prepare Expo config for production fingerprint evaluation",
    );
    const determineIndex = workflow.indexOf("- name: Determine action");

    expect(failIndex).toBe(-1);
    expect(prepareIndex).toBeGreaterThan(-1);
    expect(determineIndex).toBeGreaterThan(-1);
    expect(prepareIndex).toBeLessThan(determineIndex);
  });
});
