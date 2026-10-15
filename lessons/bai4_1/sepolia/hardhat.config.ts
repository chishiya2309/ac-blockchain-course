import "dotenv/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";

// Same compiler and profiles as ac-hardhat-template, including verification settings.
const compiler = {
  version: "0.8.37",
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "cancun",
  },
};

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: { profiles: { default: compiler, production: compiler } },
  networks: {
    default: { type: "edr-simulated", chainType: "l1", chainId: 31337 },
    localhost: {
      type: "http",
      chainType: "l1",
      chainId: 31337,
      url: configVariable("LOCALHOST_RPC_URL", { default: "http://127.0.0.1:8545" }),
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      chainId: 11155111,
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("TESTNET_PRIVATE_KEY")],
    },
  },
  // This lesson uses Etherscan for its transaction Logs UI. Sourcify also verifies the source.
  verify: {
    blockscout: { enabled: false },
    etherscan: { apiKey: configVariable("ETHERSCAN_API_KEY") },
    sourcify: { enabled: true },
  },
});
