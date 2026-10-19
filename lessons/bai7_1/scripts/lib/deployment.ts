import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAddress, isAddress } from "ethers";

export function assertChainId(actual: bigint, expected: bigint): void {
  if (actual !== expected) {
    throw new Error(`Wrong chain: expected ${expected}, RPC returned ${actual}.`);
  }
}

export async function readDeployment(
  root: string,
  chainId: bigint,
  deploymentId = `chain-${chainId}`,
): Promise<{ counter: string; token: string }> {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(deploymentId)) {
    throw new Error("DEPLOYMENT_ID must contain only letters, numbers, underscores and hyphens.");
  }
  const directory = path.join(root, "ignition", "deployments", deploymentId);
  let addresses: Record<string, unknown>;
  try {
    const journal = await readFile(path.join(directory, "journal.jsonl"), "utf8");
    const records = journal
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as { type?: string; chainId?: number });
    const initialization = records.find((record) => record.type === "DEPLOYMENT_INITIALIZE");
    if (initialization?.chainId === undefined)
      throw new Error("Missing deployment initialization.");
    assertChainId(BigInt(initialization.chainId), chainId);
    addresses = JSON.parse(
      await readFile(path.join(directory, "deployed_addresses.json"), "utf8"),
    ) as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      `Cannot read deployment "${deploymentId}" for chain ${chainId}. Deploy first or check DEPLOYMENT_ID.`,
      { cause: error },
    );
  }
  const counter = addresses["CounterModule#Counter"];
  const token = addresses["ACTokenModule#ACToken"];
  if (
    typeof counter !== "string" ||
    !isAddress(counter) ||
    typeof token !== "string" ||
    !isAddress(token)
  ) {
    throw new Error(
      `Deployment "${deploymentId}" must contain valid CounterModule#Counter and ACTokenModule#ACToken addresses.`,
    );
  }
  return { counter: getAddress(counter), token: getAddress(token) };
}

export async function requireContract(
  address: string,
  getCode: (address: string) => Promise<string>,
): Promise<void> {
  if ((await getCode(address)) === "0x") {
    throw new Error(
      `No contract bytecode at ${address}. Check the network or redeploy after restarting the local node.`,
    );
  }
}
