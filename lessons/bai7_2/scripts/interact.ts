import hre, { network } from "hardhat";
import { assertChainId, readDeployment, requireContract } from "./lib/deployment.ts";

const connection = await network.getOrCreate();
const { ethers } = connection;
const chainId = (await ethers.provider.getNetwork()).chainId;
const configuredChainId = connection.networkConfig.chainId;
if (configuredChainId !== undefined) assertChainId(chainId, BigInt(configuredChainId));

const addresses = await readDeployment(hre.config.paths.root, chainId, process.env.DEPLOYMENT_ID);
for (const address of Object.values(addresses)) {
  await requireContract(address, (value) => ethers.provider.getCode(value));
}
const counter = await ethers.getContractAt("Counter", addresses.counter);
const token = await ethers.getContractAt("ACToken", addresses.token);
const [signer] = await ethers.getSigners();
if (signer === undefined) throw new Error("No signer is configured for this network.");
console.log(`Chain: ${chainId}; signer: ${signer.address}`);
console.log(`Counter: ${addresses.counter}; before: ${await counter.getCount()}`);
const transaction = await counter.increment();
const receipt = await transaction.wait();
if (receipt === null || receipt.status !== 1)
  throw new Error("Counter transaction did not succeed.");
console.log(`Transaction: ${receipt.hash}; count: ${await counter.getCount()}`);
console.log(
  `${await token.name()} (${await token.symbol()}): ${ethers.formatUnits(await token.balanceOf(signer.address), await token.decimals())} tokens`,
);
