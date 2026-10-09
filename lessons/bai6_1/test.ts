import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { readFileSync } from "fs";
import path from "path";

dotenv.config({ path: path.join(__dirname, ".env") });

type Deployment = {
  address: string;
  receipt: { from: string };
};

async function main() {
  const deploymentPath = path.join(__dirname, "deployments", "sepolia", "MyToken.json");
  const deployment = JSON.parse(readFileSync(deploymentPath, "utf8")) as Deployment;
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(
    deployment.address,
    ["function balanceOf(address) view returns (uint256)", "function totalSupply() view returns (uint256)"],
    provider,
  );

  const deployer = deployment.receipt.from;
  const [balance, totalSupply] = await Promise.all([
    contract.balanceOf(deployer) as Promise<bigint>,
    contract.totalSupply() as Promise<bigint>,
  ]);
  const expectedSupply = ethers.parseUnits("1000000", 18);

  console.log(`MyToken contract: ${deployment.address}`);
  console.log(`Deployer: ${deployer}`);
  console.log(`Deployer balance: ${ethers.formatUnits(balance, 18)} MTK`);

  if (balance !== expectedSupply || totalSupply !== expectedSupply) {
    throw new Error("Deployer balance or total supply differs from 1,000,000 MTK.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
