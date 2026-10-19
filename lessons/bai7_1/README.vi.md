# AC Hardhat Template

[English](README.md) · [Đóng góp](CONTRIBUTING.md) · [Bảo mật](SECURITY.md)

Template smart contract mã nguồn mở MIT, kế thừa ý tưởng từ bài 5.2 của khóa học Apps Cyclone.
Có Counter, ERC20 nguồn cung cố định, test TypeScript/Solidity, deploy bằng Ignition,
verify, xuất ABI, kiểm tra kích thước contract, gas và coverage.

## Cài đặt nhanh

Yêu cầu **Node.js 24 LTS**, **npm 11**. Nếu dùng nvm, chạy `nvm use`.
Trên Windows cần Microsoft Visual C++ Redistributable để chạy native runtime của Hardhat.

Copy toàn bộ folder template sang repo riêng hoặc làm việc trực tiếp trong folder này:

```sh
npm ci
npm run check
npm run smoke
```

Không cần ví, API key hoặc file .env để chạy local. Lần cài đặt/build đầu cần internet để tải
dependencies và Solidity compiler. Template có package/lockfile riêng, không dùng dependencies ở repo cha.

Các phiên bản cố định, kiểm tra ngày 15/10/2026: Hardhat 3.19.0, toolbox Mocha/ethers 4.0.0,
Solidity 0.8.37, OpenZeppelin 5.6.1, ethers 6.17.0 và TypeScript 6.0.3.
TypeScript 6 phù hợp giới hạn dưới 6.1 của typescript-eslint đang dùng.

## Cấu trúc và contract mẫu

- `contracts/`: Counter và ACToken.
- `test/`: test Mocha/ethers cùng test Solidity.
- `ignition/modules/`: module từng contract và Template tổng hợp.
- `ignition/parameters/`: tham số deploy mẫu.
- `scripts/`: tương tác, xuất ABI, kích thước và smoke test.
- `types/`, `data/abi/`: dữ liệu sinh tự động, được Git bỏ qua.
- `.github/`: CI và các file hỗ trợ dự án open source khi tách repo.

**Counter:** bắt đầu từ 0; ai cũng có thể gọi `increment()`. Đọc bằng `count()` hoặc `getCount()`.
Mỗi lần tăng phát event `CountIncremented(caller, newCount)`.

**ACToken:** kế thừa ERC20 của OpenZeppelin, 18 decimals và chỉ mint trong constructor.
Constructor nhận tên, symbol, recipient và initialSupply theo đơn vị nhỏ nhất.
Mặc định deploy một triệu ACT cho deployer. Có thể chọn recipient khác deployer.
Không có hàm mint bổ sung, burn, quyền owner hoặc proxy.

Cả build profile mặc định và production dùng Solidity 0.8.37, optimizer 200 runs và EVM Cancun.
Giữ nguyên thiết lập này khi verify.

## Các lệnh thường dùng

| Lệnh                   | Công dụng                                         |
| ---------------------- | ------------------------------------------------- |
| `npm run compile`      | Build và sinh TypeChain                           |
| `npm test`             | Chạy toàn bộ test TypeScript/Solidity             |
| `npm run test:gas`     | Bảng gas và gas-stats.json                        |
| `npm run coverage`     | coverage/lcov.info và coverage/html/index.html    |
| `npm run abi`          | Xuất ABI JSON vào data/abi                        |
| `npm run size`         | Kiểm tra runtime bytecode không vượt 24.576 bytes |
| `npm run typecheck`    | Kiểm tra kiểu sau khi compile                     |
| `npm run lint`         | ESLint và Solhint                                 |
| `npm run format`       | Định dạng code/tài liệu                           |
| `npm run format:check` | Kiểm tra định dạng                                |
| `npm run check`        | Compile, types, lint, format, test, ABI và size   |
| `npm run smoke`        | Deploy và tương tác trên node local độc lập       |
| `npm run clean`        | Xóa build output của Hardhat                      |

Chạy gas và coverage riêng vì coverage làm thay đổi bytecode/gas.
ABI giữ cấu trúc đường dẫn, ví dụ `data/abi/contracts/Counter.sol/Counter.json`.

## Deploy và tương tác local

Terminal A:

```sh
npm run node
```

Terminal B:

```sh
npm run deploy:localhost
npm run interact:localhost
```

Có thể dùng alias `deploy:local` và `interact:local`.
Script tương tác đọc journal, kiểm tra chain và bytecode, gửi một transaction tăng Counter,
đợi receipt thành công rồi in count và số dư ACT của signer. Mỗi lần chạy tăng count một đơn vị.

Journal mặc định nằm ở `ignition/deployments/chain-31337`.
Deploy lại với cùng journal sẽ tiếp tục hoặc sử dụng kết quả deploy đã hoàn tất.
Sau khi khởi động lại node local, dùng deployment ID mới hoặc xóa riêng journal local cũ rồi deploy lại.
Giữ journal của các public deployment để tiếp tục deploy và verify.

Có thể đặt RPC local qua `LOCALHOST_RPC_URL`.
Khi dùng `--deployment-id` tùy chỉnh, đặt `DEPLOYMENT_ID` giống ID đó trước khi chạy tương tác.

## Sepolia, Ethereum và secrets

| Network   | Chain ID | RPC                          | Private key          |
| --------- | -------- | ---------------------------- | -------------------- |
| localhost | 31337    | LOCALHOST_RPC_URL (tùy chọn) | Tài khoản node local |
| sepolia   | 11155111 | SEPOLIA_RPC_URL              | TESTNET_PRIVATE_KEY  |
| ethereum  | 1        | MAINNET_RPC_URL              | MAINNET_PRIVATE_KEY  |

Nên dùng ví riêng cho dự án và keystore mã hóa:

```sh
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set TESTNET_PRIVATE_KEY
npx hardhat keystore set ETHERSCAN_API_KEY
npm run deploy:sepolia
npm run interact:sepolia
npm run verify:sepolia
```

Private key có tiền tố `0x` và 64 ký tự hex.
Các lệnh keystore hỏi giá trị trực tiếp, không cần ghi secrets vào command history.
Để dùng .env, copy `.env.example` thành `.env`, bỏ comment và điền các biến cần thiết.
Cách này dùng được trên PowerShell và Linux. Không commit private key; .env đã được Git bỏ qua.

Ethereum dùng RPC/private key riêng và các lệnh:

```sh
npm run deploy:ethereum
npm run interact:ethereum
npm run verify:ethereum
```

Tương tác có gửi transaction và tiêu tốn gas.
Các kiểm tra tự động chỉ deploy local. Verify cần ETHERSCAN_API_KEY và journal gốc.
Nếu explorer chưa index contract vừa deploy, đợi rồi verify lại cùng journal.

## Tùy chỉnh tham số

```sh
npm run deploy:localhost -- --parameters ignition/parameters/example.json
```

Tham số initialSupply dùng chuỗi JSON để tránh mất độ chính xác với số lớn.
Một token bằng `10^18` đơn vị nhỏ nhất. Thêm `"recipient": "0x..."` trong ACTokenModule
để đổi ví nhận token.

Có thể deploy riêng Counter hoặc ACToken bằng module tương ứng.
Script tương tác tổng hợp cần cả hai module trong cùng deployment ID.
Nếu public deployment dùng ID tùy chỉnh, verify bằng
`npx hardhat ignition verify YOUR_ID --network sepolia`.

## CI và xuất bản open source

CI chạy Node 24 trên Ubuntu/Windows với npm ci, check và smoke.
Ubuntu chạy thêm gas/coverage và lưu báo cáo làm CI artifact.
Repo khóa học có workflow riêng chỉ kiểm tra folder này.
Khi tách thành repo mới, giữ nguyên .github của template để kích hoạt CI/Dependabot.

Trước khi public fork, cập nhật package metadata và xem attribution MIT.
Bật GitHub private vulnerability reporting nếu cần.
`private: true` chỉ ngăn publish nhầm lên npm, mã nguồn vẫn có giấy phép MIT.

## Chuyển từ mẫu Hardhat 2

- Dùng ESM và defineConfig với plugins khai báo rõ.
- Lấy ethers từ `await network.create()`.
- Thay hardhat-deploy bằng Ignition; đọc địa chỉ từ journal.
- Dùng TypeChain chính thức trong toolbox và gas/coverage tích hợp.
- ABI/size dùng script artifact đi kèm.
- Đổi ETHERSCAN_API cũ thành ETHERSCAN_API_KEY.
- Deploy mới bằng module mới; không chuyển deployment cũ sang journal mới.

Template của bài 5.2 được giữ nguyên.

## Xử lý lỗi

- Node/npm không phù hợp: chọn Node 24 và npm 11 rồi chạy npm ci.
- Thiếu types: compile trước khi typecheck.
- Thiếu config variable: đặt đúng tên trong keystore hoặc .env.
- Thiếu journal/sai chain: kiểm tra network, DEPLOYMENT_ID và deploy lại.
- Không có bytecode: node local có thể đã restart; deploy với journal local mới.
- Không đủ tiền gas: nạp tiền đúng mạng trước khi deploy public.
- Windows không load native runtime: cài Visual C++ runtime rồi npm ci.
- Không tải được compiler: kiểm tra internet/proxy.

Tài liệu chính thức: [Hardhat](https://hardhat.org/docs/getting-started),
[Ignition](https://hardhat.org/ignition/docs/getting-started),
[OpenZeppelin ERC20](https://docs.openzeppelin.com/contracts/5.x/erc20).

## Giấy phép

MIT, Copyright (c) 2025-2026 Apps Cyclone. Xem [LICENSE](LICENSE).
