import { readFile } from "node:fs/promises";

async function readWorkflow(fileName: string) {
  return readFile(new URL(`../../../.github/workflows/${fileName}`, import.meta.url), "utf8");
}

describe("mobile fingerprint lock workflows", () => {
  it("checks the production version lock before preview fingerprint checks", async () => {
    const workflow = await readWorkflow("mobile-fingerprint-check.yml");

    const headShaInputIndex = workflow.indexOf("head_sha:");
    const lockStepIndex = workflow.indexOf("- name: Determine production version lock");
    const failStepIndex = workflow.indexOf(
      "- name: Fail when locked version no longer matches production fingerprint",
    );
    const acceptStepIndex = workflow.indexOf(
      "- name: Accept matching locked production fingerprint",
    );
    const compareStepIndex = workflow.indexOf("- name: Compare fingerprints");

    expect(headShaInputIndex).toBeGreaterThan(-1);
    expect(lockStepIndex).toBeGreaterThan(-1);
    expect(failStepIndex).toBeGreaterThan(lockStepIndex);
    expect(acceptStepIndex).toBeGreaterThan(failStepIndex);
    expect(compareStepIndex).toBeGreaterThan(acceptStepIndex);
  });

  it("checks the production version lock before fingerprint refresh generation", async () => {
    const workflow = await readWorkflow("mobile-fingerprint-refresh-pr.yml");

    const lockStepIndex = workflow.indexOf("- name: Determine production version lock");
    const failStepIndex = workflow.indexOf(
      "- name: Fail when locked version no longer matches production fingerprint",
    );
    const compareStepIndex = workflow.indexOf("- name: Compare fingerprints");
    const finalizeStepIndex = workflow.indexOf("- name: Finalize fingerprint result");
    const generateStepIndex = workflow.indexOf("- name: Generate refreshed fingerprints");

    expect(lockStepIndex).toBeGreaterThan(-1);
    expect(failStepIndex).toBeGreaterThan(lockStepIndex);
    expect(compareStepIndex).toBeGreaterThan(failStepIndex);
    expect(finalizeStepIndex).toBeGreaterThan(compareStepIndex);
    expect(generateStepIndex).toBeGreaterThan(finalizeStepIndex);
  });

  it("fails main checks when fingerprint refresh fails", async () => {
    const workflow = await readWorkflow("main-branch.yml");

    expect(workflow).toContain("needs.ci-checks.result == 'success'");
    expect(workflow).toContain("needs.fingerprint-refresh.result == 'success'");
  });

  it("passes the PR head SHA into the fingerprint check workflow", async () => {
    const workflow = await readWorkflow("pr-workflow.yml");

    expect(workflow).toContain("head_sha: ${{ github.event.pull_request.head.sha }}");
  });
});
