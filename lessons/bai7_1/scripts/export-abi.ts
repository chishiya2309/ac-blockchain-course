import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import hre from "hardhat";

const output = path.join(hre.config.paths.root, "data", "abi");
await mkdir(output, { recursive: true });
const names = [...(await hre.artifacts.getAllFullyQualifiedNames())]
  .filter((name) => name.startsWith("contracts/"))
  .sort();

for (const name of names) {
  const artifact = await hre.artifacts.readArtifact(name);
  if (artifact.bytecode === "0x") continue;
  const relative = name.replace(":", "/") + ".json";
  const filename = path.join(output, relative);
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, JSON.stringify(artifact.abi, null, 2) + "\n");
  console.log(`ABI: ${path.relative(hre.config.paths.root, filename)}`);
}
