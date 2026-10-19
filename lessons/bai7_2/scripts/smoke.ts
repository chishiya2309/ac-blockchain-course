import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
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
const node = spawn(
  process.execPath,
  [cli, "node", "--hostname", "127.0.0.1", "--port", String(port)],
  {
    cwd: root,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let nodeOutput = "";
let nodeFailure: Error | undefined;
node.once("error", (error) => {
  nodeFailure = error;
});
node.stdout.on("data", (chunk: Buffer) => {
  nodeOutput = (nodeOutput + chunk.toString()).slice(-8000);
});
node.stderr.on("data", (chunk: Buffer) => {
  nodeOutput = (nodeOutput + chunk.toString()).slice(-8000);
});

async function runHardhat(args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [cli, ...args], {
      cwd: root,
      env,
      stdio: ["ignore", "pipe", "pipe"],
      signal: AbortSignal.timeout(180_000),
    });
    let output = "";
    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
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
    if (node.exitCode !== null || node.signalCode !== null)
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
      /* Wait for the child node to finish starting. */
    }
    await setTimeout(200);
  }
  if (!ready) throw new Error(`Local node did not become ready:\n${nodeOutput}`);
  const deployArgs = [
    "ignition",
    "deploy",
    "ignition/modules/Template.ts",
    "--network",
    "localhost",
    "--deployment-id",
    id,
    "--parameters",
    "ignition/parameters/example.json",
  ];
  await runHardhat(deployArgs);
  const first = await readDeployment(root, 31337n, id);
  const tokenArtifact = await hre.artifacts.readArtifact("ACToken");
  const counterArtifact = await hre.artifacts.readArtifact("Counter");
  const token = new Contract(first.token, tokenArtifact.abi, provider);
  const counter = new Contract(first.counter, counterArtifact.abi, provider);
  const deployer = await provider.getSigner(0);
  assert.equal(await token.getFunction("name").staticCall(), "AC Token");
  assert.equal(await token.getFunction("symbol").staticCall(), "ACT");
  assert.equal(await token.getFunction("decimals").staticCall(), 18n);
  assert.equal(await token.getFunction("totalSupply").staticCall(), 1_000_000n * 10n ** 18n);
  assert.equal(
    await token.getFunction("balanceOf").staticCall(await deployer.getAddress()),
    1_000_000n * 10n ** 18n,
  );
  assert.equal(await counter.getFunction("getCount").staticCall(), 0n);
  await runHardhat(deployArgs);
  assert.deepEqual(await readDeployment(root, 31337n, id), first);
  await runHardhat(["run", "scripts/interact.ts", "--network", "localhost"]);
  assert.equal(await counter.getFunction("getCount").staticCall(), 1n);
  console.log(
    "Smoke passed: constructor arguments, journal reuse, transaction receipt and updated count.",
  );
} finally {
  provider.destroy();
  if (node.pid !== undefined && node.exitCode === null && node.signalCode === null) {
    const exited = once(node, "exit");
    node.kill();
    await exited;
  }
}
