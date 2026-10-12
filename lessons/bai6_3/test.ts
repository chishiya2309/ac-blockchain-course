import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { readFileSync } from "fs";
import path from "path";

dotenv.config({ path: path.join(__dirname, ".env") });

type Deployment = { address: string };

async function main() {
  const privateKey = process.env.TESTNET_PRIVATE_KEY?.trim();
  if (!privateKey) {
    throw new Error("Set TESTNET_PRIVATE_KEY in .env before minting on Sepolia.");
  }

  const deploymentPath = path.join(__dirname, "deployments", "sepolia", "MyNFT.json");
  const deployment = JSON.parse(readFileSync(deploymentPath, "utf8")) as Deployment;
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const network = await provider.getNetwork();
  if (network.chainId !== 11155111n) {
    throw new Error(`Expected Sepolia (11155111), got chain ID ${network.chainId}.`);
  }

  const wallet = new ethers.Wallet(privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`, provider);
  const nft = new ethers.Contract(
    deployment.address,
    [
      "function owner() view returns (address)",
      "function nextTokenId() view returns (uint256)",
      "function mint(address to)",
      "function ownerOf(uint256 tokenId) view returns (address)",
    ],
    wallet,
  );

  const contractOwner = (await nft.owner()) as string;
  if (ethers.getAddress(contractOwner) !== wallet.address) {
    throw new Error(`Signer ${wallet.address} is not the contract owner ${contractOwner}.`);
  }

  const tokenId = (await nft.nextTokenId()) as bigint;
  const tx = await nft.mint(wallet.address);
  const receipt = await tx.wait();
  if (!receipt || receipt.status !== 1) {
    throw new Error("Mint transaction was not confirmed successfully.");
  }

  const tokenOwner = (await nft.ownerOf(tokenId)) as string;
  if (ethers.getAddress(tokenOwner) !== wallet.address) {
    throw new Error(`Unexpected owner for token ${tokenId}: ${tokenOwner}.`);
  }

  console.log(`MyNFT contract: ${deployment.address}`);
  console.log(`Minted token ID: ${tokenId}`);
  console.log(`ownerOf(${tokenId}): ${tokenOwner}`);
  console.log(`Mint transaction: ${receipt.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
