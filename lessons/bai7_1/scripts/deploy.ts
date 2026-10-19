import assert from "node:assert/strict";
import { network } from "hardhat";

async function main() {
  const connection = await network.getOrCreate();
  const { ethers } = connection;

  try {
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const configuredChainId = connection.networkConfig.chainId;
    if (configuredChainId !== undefined) {
      assert.equal(chainId, BigInt(configuredChainId), "RPC chain ID does not match the network.");
    }

    const [deployer] = await ethers.getSigners();
    if (deployer === undefined) throw new Error("No deployer is configured for this network.");
    console.log(`Network: ${connection.networkName}; chain ID: ${chainId}`);
    console.log(`Deployer: ${deployer.address}`);

    if (connection.networkName === "sepolia") {
      assert.equal(chainId, 11155111n, "Expected Sepolia chain ID 11155111.");
      const ethBalance = await ethers.provider.getBalance(deployer.address);
      console.log(`Sepolia ETH balance: ${ethers.formatEther(ethBalance)}`);
      assert(ethBalance > 0n, "The deployer needs Sepolia ETH to pay deployment and mint gas.");
    }

    const token = await ethers.deployContract("MyMintableToken", [], deployer);
    const deploymentTransaction = token.deploymentTransaction();
    assert(deploymentTransaction !== null, "Missing deployment transaction.");
    console.log(`Deploy transaction: ${deploymentTransaction.hash}`);
    await token.waitForDeployment();
    const deploymentReceipt = await deploymentTransaction.wait();
    assert(deploymentReceipt !== null && deploymentReceipt.status === 1, "Deployment failed.");

    const address = await token.getAddress();
    console.log(`MyMintableToken: ${address}`);

    const amount = ethers.parseEther("1000");
    const mintTransaction = await token.mint(deployer.address, amount);
    console.log(`Mint transaction: ${mintTransaction.hash}`);
    const mintReceipt = await mintTransaction.wait();
    assert(mintReceipt !== null && mintReceipt.status === 1, "Mint transaction failed.");

    const [owner, decimals, balance, totalSupply, bytecode] = await Promise.all([
      token.owner(),
      token.decimals(),
      token.balanceOf(deployer.address),
      token.totalSupply(),
      ethers.provider.getCode(address),
    ]);
    assert.equal(owner, deployer.address, "The deployer must own the token.");
    assert.equal(decimals, 18n, "Expected 18 decimals.");
    assert.equal(balance, amount, "The deployer must hold exactly 1000 tokens.");
    assert.equal(totalSupply, amount, "Total supply must be exactly 1000 tokens.");
    assert.notEqual(bytecode, "0x", "The deployed contract must have bytecode.");

    console.log(`Owner: ${owner}`);
    console.log(`Deployer balance: ${ethers.formatEther(balance)} MMT`);
    console.log(`Balance (base units): ${balance}`);
    console.log(`Total supply: ${ethers.formatEther(totalSupply)} MMT`);
    console.log("Deployment and mint verification passed.");

    if (connection.networkName === "sepolia") {
      console.log(`Contract explorer: https://sepolia.etherscan.io/address/${address}`);
      console.log(`Deploy explorer: https://sepolia.etherscan.io/tx/${deploymentTransaction.hash}`);
      console.log(`Mint explorer: https://sepolia.etherscan.io/tx/${mintTransaction.hash}`);
    }
  } finally {
    await connection.close();
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Deployment failed.");
  process.exitCode = 1;
}
