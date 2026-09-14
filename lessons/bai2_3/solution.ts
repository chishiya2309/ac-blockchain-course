/**
 * Smart Contract Welcome mô phỏng trên TypeScript
 * Tương ứng với Bài 2.2 / Bài 2.3 trong giáo trình Blockchain
 */
export class Welcome {
    public greeting: string;
    public owner: string;

    constructor(initialGreeting: string, deployerAddress: string = "0x0000000000000000000000000000000000000000") {
        this.greeting = initialGreeting;
        this.owner = deployerAddress;
    }

    /**
     * Trả về câu chào mừng hiện tại
     */
    public getGreeting(): string {
        return this.greeting;
    }

    /**
     * (Tuỳ chọn theo đề bài) Trả về câu chào cùng với địa chỉ deployer (msg.sender)
     */
    public getGreetingWithOwner(): { greeting: string; owner: string } {
        return {
            greeting: this.greeting,
            owner: this.owner
        };
    }
}

/**
 * Mã nguồn Solidity tương ứng để dán vào Remix IDE
 */
export const WELCOME_SOLIDITY_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Welcome Smart Contract
 * @dev Bài 2.2 - Viết hàm Solidity đơn giản
 */
contract Welcome {
    string public greeting;
    address public owner;

    constructor(string memory _initialGreeting) {
        greeting = _initialGreeting;
        owner = msg.sender;
    }

    function getGreeting() public view returns (string memory) {
        return greeting;
    }

    // Tuỳ chọn: Trả thêm địa chỉ người deploy
    function getGreetingWithOwner() public view returns (string memory, address) {
        return (greeting, owner);
    }
}
`;
