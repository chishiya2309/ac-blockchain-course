import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Log, TransactionReceipt } from "ethers";

export async function writeReport(input: {
  root: string;
  chainId: bigint;
  deploymentId: string;
  contractAddress: string;
  deploymentReceipt: TransactionReceipt;
  registrationReceipt: TransactionReceipt;
  eventLog: Log;
  user: string;
  name: string;
  age: bigint;
}): Promise<string> {
  const { chainId, eventLog, deploymentReceipt, registrationReceipt } = input;
  const directory = path.join(
    input.root,
    "data",
    `chain-${chainId}`,
    input.deploymentId,
    input.contractAddress,
    input.user,
  );
  await mkdir(directory, { recursive: true });
  const explorer = chainId === 11155111n ? "https://sepolia.etherscan.io" : undefined;
  const links = explorer
    ? {
        contract: `${explorer}/address/${input.contractAddress}#code`,
        deployment: `${explorer}/tx/${deploymentReceipt.hash}`,
        registration: `${explorer}/tx/${registrationReceipt.hash}`,
        logs: `${explorer}/tx/${registrationReceipt.hash}#eventlog`,
      }
    : undefined;
  const evidence = {
    network: explorer ? "Ethereum Sepolia" : "LOCAL ONLY - not a Sepolia deployment",
    chainId: chainId.toString(),
    deploymentId: input.deploymentId,
    contractAddress: input.contractAddress,
    deploymentTransactionHash: deploymentReceipt.hash,
    registrationTransactionHash: registrationReceipt.hash,
    links,
    event: {
      signature: "StudentRegistered(address,string,uint256)",
      address: eventLog.address,
      logIndex: eventLog.index,
      topics: [...eventLog.topics],
      data: eventLog.data,
      decoded: { user: input.user, name: input.name, age: input.age.toString() },
    },
    student: { name: input.name, age: input.age.toString(), isRegistered: true },
    deploymentReceipt: deploymentReceipt.toJSON(),
    registrationReceipt: registrationReceipt.toJSON(),
  };
  await writeFile(
    path.join(directory, "registration.json"),
    JSON.stringify(evidence, null, 2) + "\n",
  );
  const words = eventLog.data.slice(2).match(/.{64}/g) ?? [];
  const wordRows = words.map((word, index) => {
    const descriptions = [
      `Offset tới phần chuỗi name: ${BigInt(`0x${word}`)} byte tính từ đầu Data`,
      `Tuổi: ${input.age} (uint256)`,
      `Độ dài chuỗi: ${Buffer.byteLength(input.name, "utf8")} byte UTF-8`,
    ];
    return `| ${index} | \`${word}\` | ${descriptions[index] ?? "Nội dung UTF-8 của name, sau đó padding 0 cho đủ bội số 32 byte"} |`;
  });
  const escape = (value: string) => value.replaceAll("|", "\\|").replaceAll("\n", " ");
  const report = `# StudentRegistered — ${evidence.network}

${explorer ? "Receipt lấy từ Ethereum Sepolia; xem các liên kết dưới đây để đối chiếu." : "**Đây là bằng chứng kiểm thử LOCAL (chain 31337), chưa deploy lên Sepolia. Các địa chỉ/hash dưới đây không dùng để tìm trên Sepolia Etherscan.**"}

## Giao dịch thực tế

- Contract: ${links ? `[${input.contractAddress}](${links.contract})` : `\`${input.contractAddress}\``}
- Deploy: ${links ? `[${deploymentReceipt.hash}](${links.deployment})` : `\`${deploymentReceipt.hash}\``}
- Đăng ký: ${links ? `[${registrationReceipt.hash}](${links.registration})` : `\`${registrationReceipt.hash}\``}
- Người đăng ký: \`${input.user}\`
- Kết quả: name = ${JSON.stringify(input.name)}, age = ${input.age}, isRegistered = true.

## Câu 1: Tìm và xác nhận event ở đâu?

1. ${links ? `Mở [giao dịch đăng ký](${links.registration}).` : "Khi có receipt Sepolia, mở hash giao dịch đăng ký trên https://sepolia.etherscan.io."}
2. Kiểm tra Status = Success, From = ví sinh viên, To = contract StudentRegistry.
3. Chọn tab **Logs**, mục **Transaction Receipt Event Logs**${links ? `, hoặc [mở trực tiếp tab Logs](${links.logs})` : ""}.
4. Chọn log có Address = \`${input.contractAddress}\` và Topics[0] như bảng dưới.
5. Khi Etherscan có ABI sau verify, Name hiển thị StudentRegistered; user, name, age được giải mã.

## Câu 2: Đọc từng thành phần trong log

| Thành phần | Giá trị thực tế và ý nghĩa |
| --- | --- |
| Address | \`${eventLog.address}\` — contract phát event |
| Name | StudentRegistered(address indexed user, string name, uint256 age) |
| Topics[0] | \`${eventLog.topics[0]}\` — Keccak-256 của StudentRegistered(address,string,uint256) |
| Topics[1] | \`${eventLog.topics[1]}\` — user = \`${input.user}\`, thêm 12 byte 0 bên trái |
| Data (decoded) | name = ${escape(JSON.stringify(input.name))}; age = ${input.age} |
| Log index | ${eventLog.index} — vị trí log trong block, không phải mã sinh viên |
| Block | ${registrationReceipt.blockNumber} — block chứa giao dịch đăng ký |

### Raw Data: mỗi dòng 32 byte

| Word (từ 0) | Hex | Giải thích |
| --- | --- | --- |
${wordRows.join("\n")}

\`user\` có indexed nên ở Topics[1]; \`name\` và \`age\` không có indexed nên ở Data.
\`uint\` trong Solidity là \`uint256\` khi tính chữ ký ABI. Không đưa tên tham số hoặc từ indexed vào chuỗi hash.
\`isRegistered\` nằm trong storage, không được emit trong event này; script đọc lại getStudent để xác nhận true.
Giao dịch deploy chỉ tạo contract và không phát StudentRegistered. Input Data của giao dịch là lời gọi register; tab Logs chứa event được phát ra trong khi thực thi.

JSON receipt đầy đủ: [registration.json](registration.json).
ABI: [Solidity ABI](https://docs.soliditylang.org/en/latest/abi-spec.html#events).
Giao diện Logs: [Etherscan Event Logs](https://kb.etherscan.com/what-is-event-logs/).
`;
  const reportPath = path.join(directory, "REPORT.md");
  await writeFile(reportPath, report);
  return reportPath;
}
