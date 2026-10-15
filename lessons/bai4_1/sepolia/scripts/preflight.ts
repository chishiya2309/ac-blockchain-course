import { network } from "hardhat";
import { assertChainId, reportFailure } from "./lib/deployment.ts";

async function main(): Promise<void> {
  const connection = await network.getOrCreate();
  const { ethers } = connection;
  const chainId = (await ethers.provider.getNetwork()).chainId;
  assertChainId(chainId, 11155111n);
  const [signer] = await ethers.getSigners();
  if (signer === undefined) throw new Error("Configure TESTNET_PRIVATE_KEY in .env first.");
  const factory = await ethers.getContractFactory("StudentRegistry");
  const transaction = await factory.getDeployTransaction();
  const gas = await signer.estimateGas(transaction);
  const feeData = await ethers.provider.getFeeData();
  const fee = feeData.maxFeePerGas ?? feeData.gasPrice;
  if (fee === null) throw new Error("RPC did not return a gas price. Retry the preflight.");
  // Reserve gas for the separate register call and allow for fee fluctuations.
  const required = ((gas + 200_000n) * fee * 120n) / 100n;
  const balance = await ethers.provider.getBalance(signer.address);
  console.log(`Chain ID: ${chainId} (Ethereum Sepolia)`);
  console.log(`Deployer/student: ${signer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} Sepolia ETH`);
  console.log(
    `Estimated deploy gas: ${gas}; budget incl. register: ${ethers.formatEther(required)} ETH`,
  );
  if (balance < required)
    throw new Error("Insufficient Sepolia ETH for the estimated deploy and register gas budget.");
  console.log("Preflight passed. No transaction was sent.");
}

await main().catch(reportFailure);
