import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { Contract, JsonRpcProvider } from "ethers";
import hre from "hardhat";
import { readDeployment } from "./lib/deployment.ts";

const root = hre.config.paths.root;
const cli = path.join(root, "node_modules", "hardhat", "dist", "src", "cli.js");
const server = createServer();
server.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
if (address === null || typeof address === "string")
  throw new Error("Cannot reserve a local port.");
const port = address.port;
await new Promise<void>((resolve, reject) =>
  server.close((error) => (error ? reject(error) : resolve())),
);
const url = `http://127.0.0.1:${port}`;
const id = `smoke-${port}-${Date.now()}`;
const env = { ...process.env, LOCALHOST_RPC_URL: url, DEPLOYMENT_ID: id, NO_COLOR: "1" };
const childNode = spawn(
  process.execPath,
  [cli, "node", "--hostname", "127.0.0.1", "--port", String(port)],
  {
    cwd: root,
    env,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let nodeOutput = "";
let nodeFailure: Error | undefined;
childNode.once("error", (error) => {
  nodeFailure = error;
});
for (const stream of [childNode.stdout, childNode.stderr])
  stream.on("data", (chunk: Buffer) => {
    nodeOutput = (nodeOutput + chunk.toString()).slice(-8000);
  });

async function runHardhat(args: string[], expectedFailure?: RegExp): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [cli, ...args], {
      cwd: root,
      env,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
      signal: AbortSignal.timeout(180_000),
    });
    let output = "";
    for (const stream of [child.stdout, child.stderr])
      stream.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (expectedFailure !== undefined) {
        if (code !== 0 && expectedFailure.test(output)) resolve();
        else reject(new Error(`Expected rejection of ${args.join(" ")}, got ${code}:\n${output}`));
      } else if (code === 0) {
        console.log(output.trim());
        resolve();
      } else reject(new Error(`hardhat ${args.join(" ")} failed (${code}):\n${output}`));
    });
  });
}

const provider = new JsonRpcProvider(url, 31337);
try {
  let ready = false;
  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (nodeFailure !== undefined) throw nodeFailure;
    if (childNode.exitCode !== null || childNode.signalCode !== null)
      throw new Error(`Local node exited:\n${nodeOutput}`);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_chainId", params: [], id: 1 }),
        signal: AbortSignal.timeout(1000),
      });
      const body = (await response.json()) as { result?: string };
      if (body.result === "0x7a69") {
        ready = true;
        break;
      }
    } catch {
      /* Wait for the local node to finish starting. */
    }
    await setTimeout(200);
  }
  if (!ready) throw new Error(`Local node did not become ready:\n${nodeOutput}`);
  // The Sepolia preflight must reject even a fully funded wallet on a different chain.
  await runHardhat(["run", "scripts/preflight.ts", "--network", "localhost"], /Wrong chain/);
  const deployArgs = [
    "ignition",
    "deploy",
    "ignition/modules/StudentRegistry.ts",
    "--network",
    "localhost",
    "--deployment-id",
    id,
  ];
  await runHardhat(deployArgs);
  const first = await readDeployment(root, 31337n, id);
  const blockAfterDeployment: string = await provider.send("eth_blockNumber", []);
  await runHardhat(deployArgs);
  assert.deepEqual(await readDeployment(root, 31337n, id), first);
  assert.equal(await provider.send("eth_blockNumber", []), blockAfterDeployment);

  await runHardhat(["run", "scripts/register.ts", "--network", "localhost"]);
  const artifact = await hre.artifacts.readArtifact("StudentRegistry");
  const registry = new Contract(first.address, artifact.abi, provider);
  const signer = await provider.getSigner(0);
  const student = await signer.getAddress();
  assert.deepEqual(
    [...(await registry.getFunction("getStudent").staticCall(student))],
    ["Nguyen Van A", 20n, true],
  );
  const directory = path.join(root, "data", "chain-31337", id, first.address, student);
  const before = await readFile(path.join(directory, "registration.json"), "utf8");
  const evidence = JSON.parse(before) as {
    network: string;
    registrationTransactionHash: string;
    event: { topics: string[]; decoded: { name: string; age: string } };
  };
  assert.match(evidence.network, /LOCAL ONLY/);
  assert.equal(evidence.event.topics.length, 2);
  assert.deepEqual(evidence.event.decoded.name, "Nguyen Van A");
  assert.equal(evidence.event.decoded.age, "20");
  const blockAfterRegistration: string = await provider.send("eth_blockNumber", []);
  await runHardhat(["run", "scripts/register.ts", "--network", "localhost"]);
  assert.equal(await provider.send("eth_blockNumber", []), blockAfterRegistration);
  const after = JSON.parse(
    await readFile(path.join(directory, "registration.json"), "utf8"),
  ) as typeof evidence;
  assert.equal(after.registrationTransactionHash, evidence.registrationTransactionHash);
  assert.match(
    await readFile(path.join(directory, "REPORT.md"), "utf8"),
    /chưa deploy lên Sepolia/,
  );
  console.log(
    "Smoke passed: correct chain guard, Ignition journal reuse, registration receipt/report, and no duplicate transactions.",
  );
} finally {
  provider.destroy();
  if (childNode.pid !== undefined && childNode.exitCode === null && childNode.signalCode === null) {
    const exited = once(childNode, "exit");
    childNode.kill();
    await exited;
  }
}
