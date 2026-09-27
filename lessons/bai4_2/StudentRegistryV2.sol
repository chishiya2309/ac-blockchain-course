// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StudentRegistryV2
 * @dev Smart contract quản lý danh sách sinh viên với phân quyền truy cập và ghi nhận sự kiện (Event).
 * Bài 4.2 - Modifier, Event và Quyền Truy Cập
 */
contract StudentRegistryV2 {
    // 1. Cấu trúc dữ liệu lưu thông tin sinh viên
    struct Student {
        string name; // Tên sinh viên
        uint age; // Tuổi sinh viên
        bool isRegistered; // Trạng thái đã đăng ký (true/false)
    }

    // 2. Biến trạng thái
    address public owner; // Địa chỉ ví của người sở hữu (deployer) contract
    mapping(address => Student) public students; // Mapping lưu trữ thông tin sinh viên theo địa chỉ ví

    // 3. Sự kiện (Event)
    // Phát ra khi một sinh viên được thêm thành công vào hệ thống
    event StudentRegistered(
        address indexed studentAddress,
        string name,
        uint age
    );

    // Phát ra khi quyền owner được chuyển giao (nếu dùng transferOwnership)
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // 4. Modifier kiểm tra quyền Owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    /**
     * @notice Constructor được chạy một lần duy nhất khi deploy contract.
     * Gán người deploy contract (msg.sender) làm owner.
     */
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @notice Chỉ owner mới có quyền thêm/đăng ký thông tin cho một sinh viên theo địa chỉ ví.
     * @dev Phương án A: Owner đăng ký theo address của sinh viên.
     * @param _studentAddress Địa chỉ ví của sinh viên cần thêm.
     * @param _name Tên của sinh viên.
     * @param _age Tuổi của sinh viên.
     */
    function registerStudent(
        address _studentAddress,
        string memory _name,
        uint _age
    ) public onlyOwner {
        // Kiểm tra địa chỉ ví sinh viên hợp lệ
        require(_studentAddress != address(0), "Invalid student address");

        // Kiểm tra sinh viên chưa từng được đăng ký trước đó
        require(
            !students[_studentAddress].isRegistered,
            "Student already registered"
        );

        // Kiểm tra tính hợp lệ của dữ liệu đầu vào
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_age > 0, "Age must be greater than 0");

        // Lưu thông tin sinh viên vào mapping
        students[_studentAddress] = Student({
            name: _name,
            age: _age,
            isRegistered: true
        });

        // Phát sự kiện ghi log lên blockchain
        emit StudentRegistered(_studentAddress, _name, _age);
    }

    /**
     * @notice Alias (hàm phụ trợ) để hỗ trợ gọi đăng ký theo tên hàm `register`.
     * @dev Chuyển tiếp lời gọi sang hàm `registerStudent`.
     * @param _studentAddress Địa chỉ ví của sinh viên.
     * @param _name Tên của sinh viên.
     * @param _age Tuổi của sinh viên.
     */
    function register(
        address _studentAddress,
        string memory _name,
        uint _age
    ) external onlyOwner {
        registerStudent(_studentAddress, _name, _age);
    }

    /**
     * @notice Lấy thông tin sinh viên theo địa chỉ ví `user`.
     * @param user Địa chỉ ví của sinh viên cần tra cứu.
     * @return name Tên của sinh viên.
     * @return age Tuổi của sinh viên.
     * @return isRegistered Trạng thái đã đăng ký (true nếu đã đăng ký, false nếu chưa).
     */
    function getStudent(
        address user
    ) public view returns (string memory name, uint age, bool isRegistered) {
        Student memory s = students[user];
        return (s.name, s.age, s.isRegistered);
    }

    /**
     * @notice Kiểm tra một địa chỉ ví đã được đăng ký làm sinh viên hay chưa.
     * @param user Địa chỉ ví cần kiểm tra.
     * @return bool Trả về true nếu đã đăng ký, ngược lại trả về false.
     */
    function isStudentRegistered(address user) public view returns (bool) {
        return students[user].isRegistered;
    }

    /**
     * @notice Cho phép owner chuyển giao quyền quản trị cho một địa chỉ mới.
     * @param newOwner Địa chỉ ví của owner mới.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(newOwner != owner, "New owner is already the current owner");

        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
