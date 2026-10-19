import "dotenv/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";

// Match the source and compiler settings used by the existing Sepolia deployment.
const compiler = {
  version: "0.8.37",
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "cancun",
  },
};

export default defineConfig({
  // The toolbox already registers @nomicfoundation/hardhat-verify 3.1.2.
  plugins: [hardhatToolboxMochaEthers],
  solidity: { profiles: { default: compiler, production: compiler } },
  networks: {
    default: { type: "edr-simulated", chainType: "l1", chainId: 31337 },
    sepolia: {
      type: "http",
      chainType: "l1",
      chainId: 11155111,
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [],
    },
  },
  verify: {
    etherscan: { enabled: true, apiKey: configVariable("ETHERSCAN_API_KEY") },
    blockscout: { enabled: false },
    sourcify: { enabled: false },
  },
});
