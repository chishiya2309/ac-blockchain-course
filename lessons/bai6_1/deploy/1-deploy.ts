import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMyToken: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployer } = await hre.getNamedAccounts();
  if (!deployer) {
    throw new Error("Missing deployer account. Set TESTNET_PRIVATE_KEY in .env before deploying to Sepolia.");
  }

  const deployment = await hre.deployments.deploy("MyToken", {
    from: deployer,
    args: [],
    log: true,
  });

  console.log(`MyToken contract address: ${deployment.address}`);
};

deployMyToken.tags = ["deploy"];
export default deployMyToken;
