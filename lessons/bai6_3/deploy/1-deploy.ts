import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMyNFT: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (!deployer) {
    throw new Error("Missing deployer account. Set TESTNET_PRIVATE_KEY in .env before deploying to Sepolia.");
  }

  console.log("====================");
  console.log(`Network: ${network.name}`);
  console.log("Deploy MyNFT Contract");
  console.log("====================");

  const deployment = await deploy("MyNFT", {
    from: deployer,
    args: [],
    log: true,
  });

  const signer = await hre.ethers.getSigner(deployer);
  const nft = await hre.ethers.getContractAt("MyNFT", deployment.address, signer);

  if ((await nft.nextTokenId()) === 0n) {
    console.log("Minting 1 NFT (tokenId 0) to deployer...");
    const mintTx = await nft.mint(deployer);
    await mintTx.wait();
  }

  console.log("====================");
  console.log(`MyNFT contract address: ${deployment.address}`);
  console.log(`ownerOf(0): ${await nft.ownerOf(0)}`);
  console.log("====================");
};

deployMyNFT.tags = ["deploy"];
export default deployMyNFT;

