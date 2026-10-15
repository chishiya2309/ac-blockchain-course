# StudentRegistry trên Ethereum Sepolia — bài 4.1

Dự án dựa trên `D:\AppsCycloneIntern\ac-hardhat-template`, dùng Hardhat 3, ethers 6 và Ignition.
Contract được copy từ bài 4.1; chỉ định dạng bản copy, không sửa chức năng hoặc contract gốc.
Compiler giữ nguyên template: Solidity **0.8.37**, optimizer **200 runs**, EVM **Cancun**;
profile `default` và `production` giống nhau để deploy và verify khớp bytecode.

## Kết quả Sepolia thực tế

- Contract đã verify **Exact Match** trên [Sepolia Etherscan](https://sepolia.etherscan.io/address/0xDed5b30e0415FA110fcb7E7d5afb9995b3AaFCE5#code): `0xDed5b30e0415FA110fcb7E7d5afb9995b3AaFCE5`.
- [Giao dịch deploy](https://sepolia.etherscan.io/tx/0xc76643fc7e155d1390f457f2c5f7ddd07c63b0ebc6a4b7b5d9227d93a1f6bf0f): `0xc76643fc7e155d1390f457f2c5f7ddd07c63b0ebc6a4b7b5d9227d93a1f6bf0f`.
- [Giao dịch đăng ký, mở sẵn tab Logs](https://sepolia.etherscan.io/tx/0x47570bc64294d928f1880b52cec1f42db2f3ab1cc0963a84b69670987b581104#eventlog): `0x47570bc64294d928f1880b52cec1f42db2f3ab1cc0963a84b69670987b581104`.
- Etherscan hiển thị **Logs (1)** → **Transaction Receipt Event Logs** → log **30** → `StudentRegistered(index_topic_1 address user, string name, uint256 age)`; Data giải mã thành `Nguyen Van A`, `20`.
- [Bài trả lời dựa trên receipt thật](data/chain-11155111/chain-11155111/0xDed5b30e0415FA110fcb7E7d5afb9995b3AaFCE5/0xA4CDcB4eFd9D4615586a6d78CB1283656078249c/REPORT.md) và [JSON receipt](data/chain-11155111/chain-11155111/0xDed5b30e0415FA110fcb7E7d5afb9995b3AaFCE5/0xA4CDcB4eFd9D4615586a6d78CB1283656078249c/registration.json).

Báo cáo chain **31337** là kiểm thử local, không tra trên Sepolia Etherscan.

## 1. Cài đặt và kiểm tra local

Yêu cầu Node.js 24 và npm 11 như template. Mở PowerShell:

```powershell
Set-Location 'D:\AppsCycloneIntern\ac-blockchain-course\lessons\bai4_1\sepolia'
npm ci
npm run check
npm run smoke
```

`check` compile, kiểm tra TypeScript/lint/format, test contract, xuất ABI và kiểm tra kích thước.
`smoke` tự mở node local, deploy bằng Ignition, đăng ký mẫu, đọc receipt và chạy lại để xác nhận
không deploy/đăng ký trùng; node tự đóng khi xong. Không cần private key hoặc `.env` để chạy local.
ABI xuất ra `data/abi/contracts/StudentRegistry.sol/StudentRegistry.json`.

## 2. Tự điền cấu hình Sepolia

```powershell
Copy-Item -LiteralPath '.env.example' -Destination '.env'
```

Chỉ chạy lệnh copy lần đầu, tránh ghi đè `.env` đã điền. Mở `.env` trên máy và điền:

| Biến                  | Giá trị cần điền                                                    |
| --------------------- | ------------------------------------------------------------------- |
| `SEPOLIA_RPC_URL`     | HTTPS JSON-RPC của **Ethereum Sepolia**, chain ID **11155111**      |
| `TESTNET_PRIVATE_KEY` | Private key ví testnet, gồm `0x` và 64 ký tự hex; ví có Sepolia ETH |
| `ETHERSCAN_API_KEY`   | API key Etherscan dùng để verify source/ABI                         |

Không điền seed phrase hoặc địa chỉ ví vào `TESTNET_PRIVATE_KEY`. Không gửi key trong chat;
`.env` đã được Git bỏ qua. Deployer cũng là ví đăng ký sinh viên vì contract dùng `msg.sender`.
Tên/tuổi mẫu sẽ công khai trên testnet: **Nguyen Van A**, **20**.

## 3. Kiểm tra, deploy và verify

```powershell
npm run preflight:sepolia
npm run deploy:sepolia
npm run verify:sepolia
```

`preflight` chỉ đọc RPC, kiểm tra đúng chain, in địa chỉ ví và số dư, ước tính gas deploy,
dành thêm 200.000 gas cho đăng ký và biên dự phòng 20%. Không gửi transaction.
`deploy:sepolia` tự chạy lại preflight trước khi deploy, sau đó Ignition hỏi xác nhận triển khai.
Ước tính phí có thể thay đổi theo mạng.

Contract không có constructor arguments. Ignition chỉ deploy **StudentRegistry**, không deploy
Counter hoặc ACToken của template. Giữ thư mục `ignition/deployments/chain-11155111` để dùng lại
deployment và verify; chạy deploy lại cùng journal sẽ dùng deployment đã có.

Lệnh verify dùng Etherscan và Sourcify. Sau verify, mở địa chỉ contract trên [Sepolia Etherscan](https://sepolia.etherscan.io), chọn
**Contract → Code**, xác nhận source đã verified và tên contract là `StudentRegistry`.
Nếu explorer chưa index, đợi một lúc rồi chạy lại **verify**, không cần deploy lại.
Nếu verify thất bại, giữ journal và sửa API key/cấu hình; event vẫn tồn tại nhưng explorer có thể
chỉ hiển thị topics/data thô nếu chưa biết ABI.

## 4. Gửi giao dịch đăng ký một sinh viên

```powershell
npm run register:sepolia
```

Script gọi `register("Nguyen Van A", 20)`, không gửi ETH kèm (`value = 0`), chỉ trả gas.
Script chờ receipt thành công, kiểm tra đúng event và đọc lại `getStudent` để xác nhận dữ liệu.
Terminal in địa chỉ contract, **hash deploy**, **hash đăng ký**, topics, raw data và link **Logs**.

Bằng chứng và bài trả lời có dữ liệu thực nằm tại:

```text
data/chain-11155111/chain-11155111/<contract>/<student>/
  registration.json   # Cả hai receipt, event thô, dữ liệu giải mã và link Etherscan
  REPORT.md           # Bài trả lời với địa chỉ/hash/giá trị thực tế
```

Chạy lại `register:sepolia` khi ví đã đăng ký sẽ tìm event cũ bằng địa chỉ contract, Topics[0]
và Topics[1], rồi dựng lại báo cáo; không gửi giao dịch đăng ký trùng. Nếu RPC không trả được
log lịch sử, script báo lỗi để bạn đổi RPC hoặc thử lại, không tự deploy contract khác.

## 5. Câu hỏi 1: Event nằm ở đâu, xác nhận bằng cách nào?

1. Lấy **hash giao dịch đăng ký** từ terminal hoặc `REPORT.md`. Giao dịch deploy không phát
   `StudentRegistered` vì event chỉ được emit trong hàm `register`.
2. Mở [Sepolia Etherscan](https://sepolia.etherscan.io), dán hash đăng ký vào ô tìm kiếm.
3. Trên **Transaction Details**, kiểm tra **Status = Success**, **From** là ví sinh viên,
   **To** là contract StudentRegistry.
4. Chọn tab **Logs**, xem mục **Transaction Receipt Event Logs**. Link trực tiếp có dạng
   `https://sepolia.etherscan.io/tx/<HASH_DANG_KY>#eventlog`.
5. Tìm log có **Address** khớp địa chỉ contract và **Topics[0]** khớp hash bên dưới.
   Khi explorer có ABI sau verify, phần **Name** hiển thị event `StudentRegistered` cùng
   `user`, `name`, `age` được giải mã. Cách explorer ghi chú tham số indexed có thể khác cách viết Solidity.
6. Đối chiếu `user` với ví ở **From**, `name = Nguyen Van A`, `age = 20`.

Trong contract hiện tại, một lần gọi trực tiếp `register` thành công tạo đúng **một** log này.
Không dùng riêng tên event để xác nhận; cần khớp cả địa chỉ phát log, Topic 0 và tham số.
Vị trí Logs và cách đọc giao diện được mô tả trong [Etherscan Event Logs](https://kb.etherscan.com/what-is-event-logs/).

## 6. Câu hỏi 2: Đọc từng thành phần trong log

Contract khai báo:

```solidity
event StudentRegistered(address indexed user, string name, uint age);
// Khi register thành công:
emit StudentRegistered(msg.sender, _name, _age);
```

Tên chính xác là **StudentRegistered**, không phải `StudentRegister`.
Chữ ký chuẩn để tính hash là `StudentRegistered(address,string,uint256)`:
`uint` được chuẩn hóa thành `uint256`; không có tên biến, khoảng trắng hoặc từ `indexed`.

| Thành phần        | Ý nghĩa và cách kiểm tra                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Address           | Địa chỉ **contract phát log**, không phải ví sinh viên. Phải khớp địa chỉ StudentRegistry đã deploy.                        |
| Name              | `StudentRegistered(address indexed user, string name, uint256 age)`, được explorer giải mã nhờ ABI.                         |
| Topics[0]         | Hash Keccak-256 32 byte của chữ ký event. Nhận diện loại event; không phải transaction hash.                                |
| Topics[1]         | `user` có `indexed`, nên địa chỉ ví được mã hóa vào topic: thêm 12 byte 0 bên trái địa chỉ 20 byte.                         |
| Data              | ABI encoding của `name` và `age`, vì hai tham số này không có `indexed`. Có thể xem dạng giải mã hoặc hex trên explorer.    |
| Chỉ số log        | Vị trí log trong block (`logIndex` ở JSON-RPC; `index` trong ethers 6). Không phải mã sinh viên và không nhất thiết bằng 0. |
| Block/transaction | Ngữ cảnh chứa log, xem trên trang giao dịch và receipt; không phải tham số của event.                                       |

**Topics[0] đã tính bằng ethers 6:**

```text
keccak256("StudentRegistered(address,string,uint256)")
= 0x9c9948e5540cad013bb3d06dd108feb894f222ad978608c957d9bd55a5c564e1
```

**Topics[1]** có dạng `0x` + 24 ký tự `0` + 40 ký tự hex địa chỉ sinh viên.
Lấy 40 ký tự hex cuối để đọc địa chỉ. `user` không nằm trong Data lần nữa.
Event này chỉ có hai topics, không có Topics[2] hoặc Topics[3].

### Giải mã raw Data của mẫu Nguyen Van A, 20

Bỏ tiền tố `0x`, chia thành các dòng **64 ký tự hex = 32 byte**:

```text
[0] 0000000000000000000000000000000000000000000000000000000000000040
[1] 0000000000000000000000000000000000000000000000000000000000000014
[2] 000000000000000000000000000000000000000000000000000000000000000c
[3] 4e677579656e2056616e20410000000000000000000000000000000000000000
```

| Word  | Cách đọc                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------------- |
| `[0]` | `0x40 = 64`: offset từ đầu Data tới phần chứa `name`. Chuỗi có độ dài động nên phần đầu chứa offset. |
| `[1]` | `0x14 = 20`: giá trị `age`, kiểu uint256.                                                            |
| `[2]` | `0x0c = 12`: độ dài `Nguyen Van A` tính bằng **byte UTF-8**.                                         |
| `[3]` | `4e677579656e2056616e2041` giải mã thành `Nguyen Van A`; phía sau thêm 20 byte 0 để đủ 32 byte.      |

Đây là ABI encoding của bộ `(string,uint256)`, không phải ba word lần lượt user/name/age.
Với tên tiếng Việt có dấu, độ dài byte UTF-8 có thể lớn hơn số ký tự và phần chuỗi có thể chiếm nhiều word.
Quy tắc topics, canonical types và dynamic data dựa trên [Solidity ABI Specification](https://docs.soliditylang.org/en/latest/abi-spec.html#events).

### Phân biệt các dữ liệu dễ nhầm

- **Input Data** ở giao dịch: function selector và tham số đầu vào của `register`; đây là lời gọi hàm.
- **Logs → Data**: tham số không indexed của event `StudentRegistered`; không có function selector.
- **`isRegistered`**: được lưu vào mapping `students`, không được emit. Dùng `getStudent(user)`
  hoặc `isStudentRegistered(user)` để đọc; không tìm bool này trong event.
- Giao dịch bị revert không giữ lại event log. Test local kiểm tra tên rỗng, tuổi 0 và đăng ký trùng;
  không cần gửi các giao dịch lỗi lên Sepolia để trả lời bài.

## 7. Chạy local thủ công và xử lý lỗi

Terminal A: `npm run node`. Terminal B:

```powershell
npm run deploy:localhost
npm run register:localhost
```

Sau khi restart node local, journal cũ không còn khớp blockchain mới. Dùng deployment ID mới:

```powershell
npm run deploy:localhost -- --deployment-id student-local-2
$env:DEPLOYMENT_ID = 'student-local-2'
npm run register:localhost
Remove-Item Env:DEPLOYMENT_ID
```

Nếu dùng deployment ID riêng trên Sepolia, truyền cùng `--deployment-id` lúc deploy,
đặt `DEPLOYMENT_ID` tương ứng lúc đăng ký và verify bằng
`npx hardhat ignition verify YOUR_ID --network sepolia`.

| Lỗi                                     | Cách xử lý                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------ |
| Thiếu config variable/không kết nối RPC | Kiểm tra `.env`, tên biến và endpoint Ethereum Sepolia.                                    |
| Wrong chain                             | Dùng RPC Ethereum Sepolia chain 11155111; không dùng một mạng khác cũng có chữ Sepolia.    |
| Insufficient Sepolia ETH                | Nạp Sepolia ETH vào địa chỉ deployer do preflight in ra.                                   |
| Verify chưa tìm thấy contract           | Chờ explorer index, rồi chạy lại verify bằng journal cũ.                                   |
| Không khớp bytecode/journal             | Kiểm tra network, deployment ID và cấu hình build; không xóa journal Sepolia.              |
| Gửi đăng ký xong nhưng RPC timeout      | Giữ hash đã in, kiểm tra trạng thái trên explorer; khi đã mined, chạy lại để lấy event cũ. |

Giấy phép MIT và các phiên bản dependencies được kế thừa template; xem [LICENSE](LICENSE).
