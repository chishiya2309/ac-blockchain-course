import "dotenv/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig, task } from "hardhat/config";

// Keep every build profile identical so deployments and verification are reproducible.
const compiler = {
  version: "0.8.37",
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "cancun",
  },
};

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  tasks: [
    task("deploy", "Deploy MyMintableToken and mint 1000 MMT to the deployer")
      .addOption({
        name: "tags",
        description: "Deployment tag (only deploy is supported)",
        defaultValue: "deploy",
      })
      .setInlineAction(async ({ tags }, hre) => {
        if (tags !== "deploy") {
          throw new Error('Unsupported deployment tag. Use "--tags deploy".');
        }
        await hre.tasks.getTask("run").run({ script: "scripts/deploy.ts", noCompile: false });
      })
      .build(),
  ],
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
    ethereum: {
      type: "http",
      chainType: "l1",
      chainId: 1,
      url: configVariable("MAINNET_RPC_URL"),
      accounts: [configVariable("MAINNET_PRIVATE_KEY")],
    },
  },
  verify: { etherscan: { apiKey: configVariable("ETHERSCAN_API_KEY") } },
});
