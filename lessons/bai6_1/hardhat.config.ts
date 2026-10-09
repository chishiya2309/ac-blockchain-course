import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "hardhat-deploy";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, ".env") });

const privateKey = process.env.TESTNET_PRIVATE_KEY?.trim();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      accounts: privateKey ? [privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`] : [],
    },
  },
  namedAccounts: {
    deployer: { default: 0 },
  },
};

export default config;
