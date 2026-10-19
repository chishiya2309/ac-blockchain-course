import { ethers, deployments } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Interacting with account:", deployer.address);

  const deployment = await deployments.get("MyNFT");
  const nft = await ethers.getContractAt("MyNFT", deployment.address, deployer);

  console.log(`MyNFT deployed at: ${deployment.address}`);
  const nextTokenId = await nft.nextTokenId();
  console.log(`Current nextTokenId: ${nextTokenId}`);

  if (nextTokenId > 0n) {
    const owner0 = await nft.ownerOf(0);
    console.log(`ownerOf(0): ${owner0}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
