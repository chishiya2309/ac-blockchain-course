import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { assertChainId, readDeployment, studentFutureId } from "../scripts/lib/deployment.ts";

describe("StudentRegistry deployment journal", function () {
  let directory: string;
  const address = "0x0000000000000000000000000000000000000001";
  const hash = "0x" + "ab".repeat(32);

  beforeEach(async function () {
    directory = await mkdtemp(path.join(os.tmpdir(), "student-registry-journal-"));
  });
  afterEach(async function () {
    assert.equal(path.dirname(directory), path.resolve(os.tmpdir()));
    assert.ok(path.basename(directory).startsWith("student-registry-journal-"));
    await rm(directory, { recursive: true, force: true });
  });

  async function writeJournal(chainId: number, addresses: object, confirmed = true): Promise<void> {
    const folder = path.join(directory, "ignition", "deployments", "chain-31337");
    await mkdir(folder, { recursive: true });
    const records: object[] = [{ type: "DEPLOYMENT_INITIALIZE", chainId }];
    if (confirmed)
      records.push({
        type: "TRANSACTION_CONFIRM",
        futureId: studentFutureId,
        hash,
        receipt: { status: "SUCCESS", blockNumber: 7, contractAddress: address },
      });
    await writeFile(
      path.join(folder, "journal.jsonl"),
      records.map((record) => JSON.stringify(record)).join("\n") + "\n",
    );
    await writeFile(path.join(folder, "deployed_addresses.json"), JSON.stringify(addresses));
  }

  it("loads the contract address and confirmed deployment receipt metadata", async function () {
    await writeJournal(31337, { [studentFutureId]: address });
    assert.deepEqual(await readDeployment(directory, 31337n), {
      address,
      transactionHash: hash,
      blockNumber: 7,
      deploymentId: "chain-31337",
    });
  });

  it("rejects missing journals and directory traversal", async function () {
    await assert.rejects(readDeployment(directory, 31337n), /Deploy first/);
    await assert.rejects(readDeployment(directory, 31337n, "../../outside"), /DEPLOYMENT_ID/);
  });

  it("rejects the wrong chain and Ethereum mainnet", async function () {
    await writeJournal(11155111, { [studentFutureId]: address });
    await assert.rejects(
      readDeployment(directory, 31337n),
      (error: unknown) =>
        error instanceof Error &&
        error.cause instanceof Error &&
        /Wrong chain/.test(error.cause.message),
    );
    assert.throws(() => assertChainId(1n, 1n), /Only localhost/);
  });

  it("rejects invalid addresses and unconfirmed deployment transactions", async function () {
    await writeJournal(31337, { [studentFutureId]: "invalid" });
    await assert.rejects(readDeployment(directory, 31337n), /valid StudentRegistryModule/);
    await writeJournal(31337, { [studentFutureId]: address }, false);
    await assert.rejects(readDeployment(directory, 31337n), /no confirmed/);
  });
});
