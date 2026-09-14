import { Welcome } from "./solution";

// Test 1: Khởi tạo và đọc giá trị thông qua property public greeting
const initialMessage = "Hello Blockchain!";
const contract = new Welcome(initialMessage);
console.assert(contract.greeting === initialMessage, "Test 1 Failed: greeting variable should match initial value");

// Test 2: Gọi hàm getGreeting()
console.assert(contract.getGreeting() === initialMessage, "Test 2 Failed: getGreeting() should return greeting");

// Test 3: Khởi tạo với một thông điệp khác và địa chỉ deployer
const deployer = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4";
const customContract = new Welcome("Chào mừng bạn đến với khóa học Blockchain", deployer);
console.assert(customContract.getGreeting() === "Chào mừng bạn đến với khóa học Blockchain", "Test 3 Failed");
console.assert(customContract.getGreetingWithOwner().owner === deployer, "Test 4 Failed: deployer address should match");

console.log("✅ All tests passed for bai2_3!");
console.log("💡 Code Solidity mẫu đã sẵn sàng trong file Welcome.sol hoặc solution.ts để bạn test trên Remix IDE.");
