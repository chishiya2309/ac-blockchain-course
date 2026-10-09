# Bài Tập 6.1 – Viết ERC20 Token cơ bản

🎯 Mục tiêu:
- Viết và deploy ERC20 Token đơn giản sử dụng OpenZeppelin.

---

## ✅ Yêu cầu

1. Viết contract tên `MyToken`:
   - Tên token: `MyToken`
   - Symbol: `MTK`
   - Tổng cung: 1,000,000 token
   - Mint toàn bộ cho deployer trong constructor

2. Viết script deploy:
   - Deploy contract
   - In địa chỉ contract

---

## 💡 Gợi ý

- Import OpenZeppelin ERC20:
```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
```
- Dùng `_mint(msg.sender, amount)` để tạo tổng cung ban đầu

---

## 🧪 Chạy script deploy

```bash
npx hardhat deploy --network sepolia --tags deploy
```

Sau khi deploy, chạy file test.ts để kiểm tra balance của địa chỉ deployer.

## Thiết lập và kiểm tra

Chạy các lệnh sau từ thư mục `lessons/bai6_1`:

```bash
npm ci
cp .env.example .env
```

Điền `TESTNET_PRIVATE_KEY` của ví Sepolia và `SEPOLIA_RPC_URL` vào `.env`. Ví cần có Sepolia ETH để trả phí deploy. Không commit `.env`.

Kiểm tra contract trên mạng Hardhat cục bộ trước khi deploy:

```bash
npm run compile
npm test
```

Deploy và in địa chỉ contract:

```bash
npx hardhat deploy --network sepolia --tags deploy
```

Sau khi deploy, đọc địa chỉ contract và địa chỉ deployer từ `deployments/sepolia/MyToken.json`, rồi kiểm tra số dư trên Sepolia:

```bash
npx ts-node test.ts
```

Kết quả mong đợi: deployer nắm giữ `1,000,000 MTK` và `totalSupply` là `1,000,000 MTK` (18 chữ số thập phân).

Lần triển khai Sepolia của bài này: contract [`0x5Fb2a43A2869871fd46e585ac4F6DA64c42c15B5`](https://sepolia.etherscan.io/address/0x5Fb2a43A2869871fd46e585ac4F6DA64c42c15B5), giao dịch [`0xf3a74a6e8263f429ec3693158f2d435fa5eb1c613e5081224ab6d4d6ffbb6e2f`](https://sepolia.etherscan.io/tx/0xf3a74a6e8263f429ec3693158f2d435fa5eb1c613e5081224ab6d4d6ffbb6e2f).
