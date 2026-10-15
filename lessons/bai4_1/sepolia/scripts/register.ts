import hre, { network } from "hardhat";
import { assertChainId, readDeployment, reportFailure } from "./lib/deployment.ts";
import { writeReport } from "./lib/report.ts";

async function main(): Promise<void> {
  const connection = await network.getOrCreate();
  const { ethers } = connection;
  const chainId = (await ethers.provider.getNetwork()).chainId;
  const expected = connection.networkConfig.chainId;
  if (expected === undefined)
    throw new Error("The selected network must have an explicit chain ID.");
  assertChainId(chainId, BigInt(expected));
  const deployment = await readDeployment(
    hre.config.paths.root,
    chainId,
    process.env.DEPLOYMENT_ID,
  );
  const artifact = await hre.artifacts.readArtifact("StudentRegistry");
  if (
    (await ethers.provider.getCode(deployment.address)).toLowerCase() !==
    artifact.deployedBytecode.toLowerCase()
  )
    throw new Error(
      "Contract bytecode does not match StudentRegistry. Check the journal/network/build.",
    );
  const contract = await ethers.getContractAt("StudentRegistry", deployment.address);
  const [signer] = await ethers.getSigners();
  if (signer === undefined) throw new Error("No signer configured for this network.");
  const topic = contract.interface.getEvent("StudentRegistered").topicHash;
  console.log(`Chain: ${chainId}; contract: ${deployment.address}; student: ${signer.address}`);

  let receipt;
  if (await contract.isStudentRegistered(signer.address)) {
    console.log(
      "Student already registered. Finding the existing event; no transaction will be sent.",
    );
    const latest = await ethers.provider.getBlockNumber();
    for (let start = deployment.blockNumber; start <= latest; start += 1000) {
      const logs = await ethers.provider.getLogs({
        address: deployment.address,
        topics: [topic, ethers.zeroPadValue(signer.address, 32)],
        fromBlock: start,
        toBlock: Math.min(start + 999, latest),
      });
      const log = logs[0];
      if (log !== undefined) {
        receipt = await ethers.provider.getTransactionReceipt(log.transactionHash);
        break;
      }
    }
    if (receipt === undefined || receipt === null)
      throw new Error(
        "Student is registered, but RPC did not return the historical event. Retry with an RPC that supports log queries.",
      );
  } else {
    const gas = await contract.register.estimateGas("Nguyen Van A", 20n);
    const feeData = await ethers.provider.getFeeData();
    const fee = feeData.maxFeePerGas ?? feeData.gasPrice;
    if (fee === null) throw new Error("RPC did not return a gas price.");
    const gasLimit = (gas * 120n) / 100n;
    if ((await ethers.provider.getBalance(signer.address)) < gasLimit * fee)
      throw new Error("Insufficient Sepolia ETH to register. Add testnet gas funds first.");
    // register is nonpayable; omitting value sends 0 ETH.
    const transaction = await contract.register("Nguyen Van A", 20n, { gasLimit });
    console.log(`Registration submitted: ${transaction.hash}`);
    receipt = await transaction.wait(1, 180_000);
  }
  if (receipt === null || receipt.status !== 1) throw new Error("Registration did not succeed.");
  const eventLogs = receipt.logs.filter(
    (log) =>
      log.address.toLowerCase() === deployment.address.toLowerCase() && log.topics[0] === topic,
  );
  const eventLog = eventLogs[0];
  if (eventLogs.length !== 1 || eventLog === undefined || eventLog.topics.length !== 2)
    throw new Error("Expected exactly one StudentRegistered event with two topics.");
  const event = contract.interface.parseLog(eventLog);
  if (event === null) throw new Error("Cannot decode StudentRegistered.");
  const user = ethers.getAddress(String(event.args[0]));
  const name = String(event.args[1]);
  const age = BigInt(event.args[2]);
  const student = await contract.getStudent(signer.address);
  if (user !== signer.address || student[0] !== name || student[1] !== age || student[2] !== true)
    throw new Error("Event arguments do not match the signer and stored student.");
  const deploymentReceipt = await ethers.provider.getTransactionReceipt(deployment.transactionHash);
  if (deploymentReceipt === null || deploymentReceipt.status !== 1)
    throw new Error("Cannot retrieve the successful deployment receipt.");
  const report = await writeReport({
    root: hre.config.paths.root,
    chainId,
    deploymentId: deployment.deploymentId,
    contractAddress: deployment.address,
    deploymentReceipt,
    registrationReceipt: receipt,
    eventLog,
    user,
    name,
    age,
  });
  console.log(`StudentRegistered: user=${user}, name=${JSON.stringify(name)}, age=${age}`);
  console.log(`Deployment transaction: ${deploymentReceipt.hash}`);
  console.log(`Registration transaction: ${receipt.hash}`);
  console.log(`Topics: ${JSON.stringify(eventLog.topics)}\nData: ${eventLog.data}`);
  if (chainId === 11155111n)
    console.log(`Logs: https://sepolia.etherscan.io/tx/${receipt.hash}#eventlog`);
  else console.log("LOCAL evidence only; these transaction hashes are not on Sepolia.");
  console.log(`Report: ${report}`);
}

await main().catch(reportFailure);
