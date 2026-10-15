import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAddress, isAddress } from "ethers";

export const studentFutureId = "StudentRegistryModule#StudentRegistry";

export function assertChainId(actual: bigint, expected: bigint): void {
  if (actual !== expected) throw new Error(`Wrong chain: expected ${expected}, got ${actual}.`);
  if (actual !== 31337n && actual !== 11155111n)
    throw new Error("Only localhost (31337) and Ethereum Sepolia (11155111) are supported.");
}

export async function readDeployment(
  root: string,
  chainId: bigint,
  deploymentId = `chain-${chainId}`,
): Promise<{
  address: string;
  transactionHash: string;
  blockNumber: number;
  deploymentId: string;
}> {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(deploymentId))
    throw new Error("DEPLOYMENT_ID must contain only letters, numbers, underscores and hyphens.");
  const directory = path.join(root, "ignition", "deployments", deploymentId);
  let addresses: Record<string, unknown>;
  let records: {
    type?: string;
    chainId?: number;
    futureId?: string;
    hash?: string;
    receipt?: { blockNumber?: number; contractAddress?: string; status?: string };
  }[];
  try {
    const journal = await readFile(path.join(directory, "journal.jsonl"), "utf8");
    records = journal
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    const initialization = records.find((record) => record.type === "DEPLOYMENT_INITIALIZE");
    if (initialization?.chainId === undefined)
      throw new Error("Missing deployment initialization.");
    assertChainId(BigInt(initialization.chainId), chainId);
    addresses = JSON.parse(await readFile(path.join(directory, "deployed_addresses.json"), "utf8"));
  } catch (error) {
    throw new Error(
      `Cannot read deployment ${deploymentId}. Deploy first or check DEPLOYMENT_ID.`,
      {
        cause: error,
      },
    );
  }
  const address = addresses[studentFutureId];
  if (typeof address !== "string" || !isAddress(address))
    throw new Error(`Deployment must contain a valid ${studentFutureId} address.`);
  const confirmation = records.findLast(
    (record) =>
      record.type === "TRANSACTION_CONFIRM" &&
      record.futureId === studentFutureId &&
      record.receipt?.status === "SUCCESS" &&
      record.receipt.contractAddress?.toLowerCase() === address.toLowerCase(),
  );
  if (
    confirmation?.hash === undefined ||
    !/^0x[0-9a-fA-F]{64}$/.test(confirmation.hash) ||
    confirmation.receipt?.blockNumber === undefined
  )
    throw new Error("The journal has no confirmed StudentRegistry deployment transaction.");
  return {
    address: getAddress(address),
    transactionHash: confirmation.hash,
    blockNumber: confirmation.receipt.blockNumber,
    deploymentId,
  };
}

export function reportFailure(error: unknown): void {
  let message = error instanceof Error ? error.message : String(error);
  for (const key of ["SEPOLIA_RPC_URL", "TESTNET_PRIVATE_KEY", "ETHERSCAN_API_KEY"]) {
    const secret = process.env[key];
    if (secret) message = message.replaceAll(secret, `[${key} hidden]`);
  }
  console.error(message);
  process.exitCode = 1;
}
