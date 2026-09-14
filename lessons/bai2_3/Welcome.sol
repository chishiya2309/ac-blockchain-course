// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Welcome
 * @dev Smart contract đơn giản cho Bài 2.2 / Bài 2.3
 */
contract Welcome {
    // Biến greeting dạng string, khai báo public
    string public greeting;
    
    // Địa chỉ của người deploy contract (msg.sender)
    address public owner;

    /**
     * @dev Constructor truyền vào giá trị khởi tạo cho greeting
     * @param _initialGreeting Giá trị ban đầu của greeting
     */
    constructor(string memory _initialGreeting) {
        greeting = _initialGreeting;
        owner = msg.sender;
    }

    /**
     * @dev Hàm getGreeting() trả về greeting
     * @return Chuỗi greeting hiện tại
     */
    function getGreeting() public view returns (string memory) {
        return greeting;
    }

    /**
     * @dev (Tuỳ chọn) Trả thêm địa chỉ người deploy (msg.sender)
     * @return Chuỗi greeting và địa chỉ owner
     */
    function getGreetingWithOwner() public view returns (string memory, address) {
        return (greeting, owner);
    }
}
