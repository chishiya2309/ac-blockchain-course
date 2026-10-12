import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMyNFT: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployer } = await hre.getNamedAccounts();
  if (!deployer) {
    throw new Error("Missing deployer account. Set TESTNET_PRIVATE_KEY in .env before deploying to Sepolia.");
  }

  const deployment = await hre.deployments.deploy("MyNFT", {
    from: deployer,
    args: [],
    log: true,
  });

  const signer = await hre.ethers.getSigner(deployer);
  const nft = await hre.ethers.getContractAt("MyNFT", deployment.address, signer);
  if ((await nft.nextTokenId()) === 0n) {
    const mintTx = await nft.mint(deployer);
    await mintTx.wait();
  }

  console.log(`MyNFT contract address: ${deployment.address}`);
  console.log(`ownerOf(0): ${await nft.ownerOf(0)}`);
};

deployMyNFT.tags = ["deploy"];
export default deployMyNFT;
