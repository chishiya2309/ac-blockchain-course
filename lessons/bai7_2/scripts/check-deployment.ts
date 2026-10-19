import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import hre, { network } from "hardhat";

interface DeploymentReference {
  contractAddress: string;
  deployer: string;
  deployTransaction: { hash: string };
  mintTransaction: { hash: string };
}

const reference = JSON.parse(
  await readFile(new URL("../deployment-sepolia.json", import.meta.url), "utf8"),
) as DeploymentReference;
const connection = await network.getOrCreate();
const { ethers } = connection;

try {
  const chainId = (await ethers.provider.getNetwork()).chainId;
  assert.equal(chainId, 11155111n, "Expected Sepolia chain ID 11155111.");

  const artifact = await hre.artifacts.readArtifact("MyMintableToken");
  const token = await ethers.getContractAt("MyMintableToken", reference.contractAddress);
  const [
    bytecode,
    name,
    symbol,
    owner,
    decimals,
    balance,
    totalSupply,
    deployReceipt,
    mintReceipt,
  ] = await Promise.all([
    ethers.provider.getCode(reference.contractAddress),
    token.name(),
    token.symbol(),
    token.owner(),
    token.decimals(),
    token.balanceOf(reference.deployer),
    token.totalSupply(),
    ethers.provider.getTransactionReceipt(reference.deployTransaction.hash),
    ethers.provider.getTransactionReceipt(reference.mintTransaction.hash),
  ]);

  assert.notEqual(bytecode, "0x", "The contract must exist on Sepolia.");
  assert.equal(
    bytecode,
    artifact.deployedBytecode,
    "Runtime bytecode does not match the artifact.",
  );
  assert.equal(name, "MyMintableToken");
  assert.equal(symbol, "MMT");
  assert.equal(owner, reference.deployer);
  assert.equal(decimals, 18n);
  assert.equal(balance, ethers.parseEther("1000"));
  assert.equal(totalSupply, ethers.parseEther("1000"));
  assert(deployReceipt !== null && deployReceipt.status === 1, "Original deployment must succeed.");
  assert.equal(deployReceipt.contractAddress, reference.contractAddress);
  assert(mintReceipt !== null && mintReceipt.status === 1, "Original mint must succeed.");

  console.log(
    JSON.stringify(
      {
        network: connection.networkName,
        chainId: Number(chainId),
        contractAddress: reference.contractAddress,
        name,
        symbol,
        owner,
        deployer: reference.deployer,
        decimals: Number(decimals),
        balanceBaseUnits: balance.toString(),
        balanceFormatted: ethers.formatEther(balance),
        totalSupplyBaseUnits: totalSupply.toString(),
        totalSupplyFormatted: ethers.formatEther(totalSupply),
        runtimeBytecodeMatchesArtifact: true,
        deploymentTransaction: reference.deployTransaction.hash,
        mintTransaction: reference.mintTransaction.hash,
        originalTransactionsConfirmed: true,
        signerCount: (await ethers.getSigners()).length,
        checkedAtUTC: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
} finally {
  await connection.close();
}
