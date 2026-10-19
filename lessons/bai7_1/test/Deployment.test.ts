import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { assertChainId, readDeployment, requireContract } from "../scripts/lib/deployment.ts";

describe("Deployment journal validation", function () {
  let directory: string;
  const counter = "0x0000000000000000000000000000000000000001";
  const token = "0x0000000000000000000000000000000000000002";

  beforeEach(async function () {
    directory = await mkdtemp(path.join(os.tmpdir(), "ac-hardhat-journal-"));
  });
  afterEach(async function () {
    await rm(directory, { recursive: true, force: true });
  });

  async function writeJournal(chainId: number, addresses: object): Promise<void> {
    const folder = path.join(directory, "ignition", "deployments", "chain-31337");
    await mkdir(folder, { recursive: true });
    await writeFile(
      path.join(folder, "journal.jsonl"),
      JSON.stringify({ type: "DEPLOYMENT_INITIALIZE", chainId }) + "\n",
    );
    await writeFile(path.join(folder, "deployed_addresses.json"), JSON.stringify(addresses));
  }

  it("loads both contracts from a journal on the requested chain", async function () {
    await writeJournal(31337, { "CounterModule#Counter": counter, "ACTokenModule#ACToken": token });
    assert.deepEqual(await readDeployment(directory, 31337n), { counter, token });
  });

  it("fails clearly when the journal is missing", async function () {
    await assert.rejects(readDeployment(directory, 31337n), /Deploy first/);
  });

  it("rejects a copied journal for another chain", async function () {
    await writeJournal(1, { "CounterModule#Counter": counter, "ACTokenModule#ACToken": token });
    await assert.rejects(
      readDeployment(directory, 31337n),
      (error: unknown) =>
        error instanceof Error &&
        error.cause instanceof Error &&
        /Wrong chain/.test(error.cause.message),
    );
    assert.throws(() => assertChainId(1n, 31337n), /Wrong chain/);
  });

  it("rejects missing or malformed contract addresses", async function () {
    await writeJournal(31337, { "CounterModule#Counter": "invalid" });
    await assert.rejects(readDeployment(directory, 31337n), /valid CounterModule/);
  });

  it("rejects directory traversal in a custom deployment ID", async function () {
    await assert.rejects(readDeployment(directory, 31337n, "../../other"), /DEPLOYMENT_ID/);
  });

  it("detects a stale address after a local node reset", async function () {
    await assert.rejects(
      requireContract(counter, async () => "0x"),
      /No contract bytecode/,
    );
    await requireContract(counter, async () => "0x6000");
  });
});
