# Bài Tập 6.3 – Mint NFT bằng Hardhat

🎯 Mục tiêu:
- Viết, deploy và mint NFT ERC721 bằng Hardhat.

---

## ✅ Yêu cầu

1. Viết contract `MyNFT`:
   - Kế thừa từ ERC721
   - Biến `nextTokenId`
   - Hàm `mint(address to)` chỉ owner gọi được
   - Mỗi lần mint tăng `nextTokenId`

2. Viết script deploy:
   - Deploy contract
   - Mint 1 NFT cho deployer
   - In `ownerOf(0)`

---

## 💡 Gợi ý

- Dùng `_safeMint(to, nextTokenId)` để mint NFT
- Hàm `ownerOf()` trả về địa chỉ chủ sở hữu

---

## 🧪 Chạy lệnh

```bash
npx hardhat deploy --network sepolia --tags deploy
```
Sau khi deploy, chạy file test.ts để mint một NFT và trả về địa chỉ sở hữu.

## Thiết lập và kiểm tra

Chạy các lệnh sau từ thư mục `lessons/bai6_3`:

```bash
npm ci
cp .env.example .env
```

Dự án dùng Hardhat `2.25.0` và TypeScript CommonJS. Dùng `npm ci` để cài đúng phiên bản đã khóa trong `package-lock.json`. Nếu gặp thông báo “Hardhat only supports ESM projects”, chạy lại `npm ci` trong thư mục này để khôi phục Hardhat 2.

Điền `TESTNET_PRIVATE_KEY` của ví Sepolia và `SEPOLIA_RPC_URL` vào `.env`. Ví cần có Sepolia ETH để trả phí giao dịch. Không commit `.env`.

Kiểm tra cục bộ trước khi dùng Sepolia:

```bash
npm run compile
npm test
npx hardhat deploy --network hardhat --tags deploy
```

Mạng `hardhat` tạo blockchain cục bộ mới mỗi lần chạy lệnh. Cấu hình `saveDeployments: false` giúp mỗi lần deploy tạo contract và mint token `0` trên blockchain mới, không dùng lại địa chỉ từ lần chạy trước.

Deploy lên Sepolia từ thư mục này:

```bash
npx hardhat deploy --network sepolia --tags deploy
```

Script deploy mint token `0` cho deployer và in `ownerOf(0)`. Chạy lại lệnh trên cùng deployment sẽ không mint thêm token. Địa chỉ contract được lưu ở `deployments/sepolia/MyNFT.json`.

Sau khi deploy, mint thêm một NFT bằng ví owner và in địa chỉ sở hữu của token vừa mint:

```bash
npx ts-node test.ts
```

Hoặc kiểm tra thông tin deployment qua Hardhat script (tương tự template `bai5_2`):

```bash
npm run test:script
```

Mỗi lần chạy `test.ts` thành công sẽ tạo thêm một NFT và tốn phí giao dịch Sepolia.

Lần triển khai Sepolia của bài này: contract [`0xfC2Be5a9AF29D36578588a57b87F95ecdAB6F776`](https://sepolia.etherscan.io/address/0xfC2Be5a9AF29D36578588a57b87F95ecdAB6F776), giao dịch deploy [`0xd7f0738d55ef4617e1e3e218db0b0b098c3e74e286a9a34c24112ffb25a26c23`](https://sepolia.etherscan.io/tx/0xd7f0738d55ef4617e1e3e218db0b0b098c3e74e286a9a34c24112ffb25a26c23), giao dịch mint token `1` [`0xfd1aae6def3c8112843ad69cce4a5fb73a540f55654fab0ff2f06580f1530a66`](https://sepolia.etherscan.io/tx/0xfd1aae6def3c8112843ad69cce4a5fb73a540f55654fab0ff2f06580f1530a66).
