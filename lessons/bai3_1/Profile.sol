// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Profile
 * @dev Smart contract lưu trữ và cập nhật thông tin hồ sơ người dùng (name, age).
 * Bài 3.1 - Kiểu dữ liệu và biến Solidity
 */
contract Profile {
    // Biến trạng thái (state variable) lưu tên, kiểu dữ liệu string, khai báo public (tự động tạo getter function name())
    string public name;

    // Biến trạng thái lưu tuổi, kiểu dữ liệu uint (tương đương uint256), khai báo public (tự động tạo getter function age())
    uint public age;

    /**
     * @notice Cập nhật thông tin name và age cho Profile.
     * @dev Do string là kiểu tham chiếu (reference type), tham số _name cần chỉ định vị trí lưu trữ là memory.
     * @param _name Tên mới cần cập nhật.
     * @param _age Độ tuổi mới cần cập nhật.
     */
    function setProfile(string memory _name, uint _age) public {
        name = _name;
        age = _age;
    }
}
