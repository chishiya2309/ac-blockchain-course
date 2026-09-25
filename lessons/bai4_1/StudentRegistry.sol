// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StudentRegistry
 * @dev Smart contract quản lý việc đăng ký thông tin sinh viên sử dụng Struct và Mapping.
 * Bài 4.1 - Mapping, Struct, Array
 */
contract StudentRegistry {
    // Định nghĩa struct Student chứa thông tin cơ bản của sinh viên
    struct Student {
        string name;        // Tên sinh viên
        uint age;           // Tuổi sinh viên
        bool isRegistered;  // Trạng thái đã đăng ký (true/false)
    }

    // Mapping lưu trữ thông tin sinh viên theo địa chỉ ví (address => Student)
    mapping(address => Student) public students;

    // Sự kiện được phát ra khi một sinh viên đăng ký thành công
    event StudentRegistered(address indexed user, string name, uint age);

    /**
     * @notice Đăng ký thông tin cho chính người gọi hàm (caller - msg.sender).
     * @dev Kiểm tra người dùng chưa đăng ký trước đó và các thông tin đầu vào phải hợp lệ.
     * @param _name Tên của sinh viên.
     * @param _age Tuổi của sinh viên.
     */
    function register(string memory _name, uint _age) public {
        // Kiểm tra xem địa chỉ ví này đã đăng ký trước đó hay chưa
        require(!students[msg.sender].isRegistered, "Student already registered");

        // Kiểm tra dữ liệu đầu vào hợp lệ
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_age > 0, "Age must be greater than 0");

        // Lưu thông tin sinh viên vào mapping theo địa chỉ msg.sender
        students[msg.sender] = Student({
            name: _name,
            age: _age,
            isRegistered: true
        });

        // Phát ra sự kiện lưu log trên blockchain
        emit StudentRegistered(msg.sender, _name, _age);
    }

    /**
     * @notice Lấy thông tin sinh viên theo địa chỉ ví `user`.
     * @param user Địa chỉ ví của sinh viên cần tra cứu.
     * @return name Tên của sinh viên.
     * @return age Tuổi của sinh viên.
     * @return isRegistered Trạng thái đã đăng ký hay chưa.
     */
    function getStudent(address user) public view returns (string memory name, uint age, bool isRegistered) {
        Student memory s = students[user];
        return (s.name, s.age, s.isRegistered);
    }

    /**
     * @notice Kiểm tra một địa chỉ ví đã đăng ký làm sinh viên hay chưa.
     * @param user Địa chỉ ví cần kiểm tra.
     * @return bool Trả về true nếu đã đăng ký, ngược lại trả về false.
     */
    function isStudentRegistered(address user) public view returns (bool) {
        return students[user].isRegistered;
    }
}
