import hre from "hardhat";

const limit = 24_576;
let oversized = false;
const names = [...(await hre.artifacts.getAllFullyQualifiedNames())]
  .filter((name) => name.startsWith("contracts/"))
  .sort();

for (const name of names) {
  const { deployedBytecode } = await hre.artifacts.readArtifact(name);
  if (deployedBytecode === "0x") continue;
  const bytes = (deployedBytecode.length - 2) / 2;
  console.log(`${name}: ${bytes} / ${limit} bytes (runtime)`);
  if (bytes > limit) oversized = true;
}
if (oversized) throw new Error("Runtime bytecode exceeds the 24,576-byte EIP-170 limit.");
