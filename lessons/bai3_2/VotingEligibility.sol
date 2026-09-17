// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VotingEligibility
 * @dev Smart contract kiểm tra điều kiện độ tuổi bỏ phiếu và quản lý bởi Deployer.
 * Bài 3.2 - Hàm, Control Flow và Visibility
 */
contract VotingEligibility {
    // Địa chỉ của người deploy contract (owner)
    address public owner;

    // Độ tuổi tối thiểu để đủ điều kiện bỏ phiếu (mặc định khởi tạo = 18)
    uint public minAge = 18;

    /**
     * @dev Constructor được gọi duy nhất 1 lần khi deploy contract.
     * Lưu lại địa chỉ người deploy vào biến owner.
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Kiểm tra một người với độ tuổi `age` có đủ điều kiện bỏ phiếu hay không.
     * @param age Độ tuổi cần kiểm tra.
     * @return bool Trả về true nếu age >= minAge, ngược lại trả về false.
     */
    function checkEligibility(uint age) public view returns (bool) {
        if (age >= minAge) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @notice Cập nhật lại độ tuổi tối thiểu `minAge`.
     * @dev Chỉ cho phép người deploy (owner) gọi hàm này.
     * @param newMinAge Giá trị tuổi tối thiểu mới.
     */
    function updateMinAge(uint newMinAge) public {
        // Kiểm tra người gọi hàm (msg.sender) có phải là người deploy (owner) hay không
        require(msg.sender == owner, "Only owner can update minAge");

        // Cập nhật giá trị minAge mới
        minAge = newMinAge;
    }
}
