# StudentRegistered — Ethereum Sepolia

Receipt lấy từ Ethereum Sepolia; xem các liên kết dưới đây để đối chiếu.

## Giao dịch thực tế

- Contract: [0xDed5b30e0415FA110fcb7E7d5afb9995b3AaFCE5](https://sepolia.etherscan.io/address/0xDed5b30e0415FA110fcb7E7d5afb9995b3AaFCE5#code)
- Deploy: [0xc76643fc7e155d1390f457f2c5f7ddd07c63b0ebc6a4b7b5d9227d93a1f6bf0f](https://sepolia.etherscan.io/tx/0xc76643fc7e155d1390f457f2c5f7ddd07c63b0ebc6a4b7b5d9227d93a1f6bf0f)
- Đăng ký: [0x47570bc64294d928f1880b52cec1f42db2f3ab1cc0963a84b69670987b581104](https://sepolia.etherscan.io/tx/0x47570bc64294d928f1880b52cec1f42db2f3ab1cc0963a84b69670987b581104)
- Người đăng ký: `0xA4CDcB4eFd9D4615586a6d78CB1283656078249c`
- Kết quả: name = "Nguyen Van A", age = 20, isRegistered = true.

## Câu 1: Tìm và xác nhận event ở đâu?

1. Mở [giao dịch đăng ký](https://sepolia.etherscan.io/tx/0x47570bc64294d928f1880b52cec1f42db2f3ab1cc0963a84b69670987b581104).
2. Kiểm tra Status = Success, From = ví sinh viên, To = contract StudentRegistry.
3. Chọn tab **Logs**, mục **Transaction Receipt Event Logs**, hoặc [mở trực tiếp tab Logs](https://sepolia.etherscan.io/tx/0x47570bc64294d928f1880b52cec1f42db2f3ab1cc0963a84b69670987b581104#eventlog).
4. Chọn log có Address = `0xDed5b30e0415FA110fcb7E7d5afb9995b3AaFCE5` và Topics[0] như bảng dưới.
5. Khi Etherscan có ABI sau verify, Name hiển thị StudentRegistered; user, name, age được giải mã.

## Câu 2: Đọc từng thành phần trong log

| Thành phần | Giá trị thực tế và ý nghĩa |
| --- | --- |
| Address | `0xDed5b30e0415FA110fcb7E7d5afb9995b3AaFCE5` — contract phát event |
| Name | StudentRegistered(address indexed user, string name, uint256 age) |
| Topics[0] | `0x9c9948e5540cad013bb3d06dd108feb894f222ad978608c957d9bd55a5c564e1` — Keccak-256 của StudentRegistered(address,string,uint256) |
| Topics[1] | `0x000000000000000000000000a4cdcb4efd9d4615586a6d78cb1283656078249c` — user = `0xA4CDcB4eFd9D4615586a6d78CB1283656078249c`, thêm 12 byte 0 bên trái |
| Data (decoded) | name = "Nguyen Van A"; age = 20 |
| Log index | 30 — vị trí log trong block, không phải mã sinh viên |
| Block | 11917603 — block chứa giao dịch đăng ký |

### Raw Data: mỗi dòng 32 byte

| Word (từ 0) | Hex | Giải thích |
| --- | --- | --- |
| 0 | `0000000000000000000000000000000000000000000000000000000000000040` | Offset tới phần chuỗi name: 64 byte tính từ đầu Data |
| 1 | `0000000000000000000000000000000000000000000000000000000000000014` | Tuổi: 20 (uint256) |
| 2 | `000000000000000000000000000000000000000000000000000000000000000c` | Độ dài chuỗi: 12 byte UTF-8 |
| 3 | `4e677579656e2056616e20410000000000000000000000000000000000000000` | Nội dung UTF-8 của name, sau đó padding 0 cho đủ bội số 32 byte |

`user` có indexed nên ở Topics[1]; `name` và `age` không có indexed nên ở Data.
`uint` trong Solidity là `uint256` khi tính chữ ký ABI. Không đưa tên tham số hoặc từ indexed vào chuỗi hash.
`isRegistered` nằm trong storage, không được emit trong event này; script đọc lại getStudent để xác nhận true.
Giao dịch deploy chỉ tạo contract và không phát StudentRegistered. Input Data của giao dịch là lời gọi register; tab Logs chứa event được phát ra trong khi thực thi.

JSON receipt đầy đủ: [registration.json](registration.json).
ABI: [Solidity ABI](https://docs.soliditylang.org/en/latest/abi-spec.html#events).
Giao diện Logs: [Etherscan Event Logs](https://kb.etherscan.com/what-is-event-logs/).
