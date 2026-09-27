// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Voting
 * @dev Smart contract bỏ phiếu (Voting) với phân quyền người quản trị (owner)
 *      và cơ chế ghi log sự kiện (event) khi bỏ phiếu thành công.
 *      Bài 4.3 - Bài tập tổng hợp: Struct, Mapping, Modifier, Event.
 */
contract Voting {
    // 1. Cấu trúc dữ liệu biểu diễn một ứng viên
    struct Candidate {
        string name; // Tên ứng viên
        uint voteCount; // Số phiếu đã nhận được
    }

    // 2. Biến trạng thái (State Variables)
    address public owner; // Địa chỉ người tạo (admin/owner) contract
    uint public candidatesCount; // Tổng số lượng ứng viên đã được tạo (ID tự tăng)

    // Mapping lưu trữ danh sách ứng viên theo ID (bắt đầu từ 1)
    mapping(uint => Candidate) public candidates;

    // Mapping lưu trạng thái đã bỏ phiếu của từng địa chỉ ví
    mapping(address => bool) public hasVoted;

    // 3. Sự kiện (Events)
    // Phát ra mỗi khi người dùng bỏ phiếu thành công
    event Voted(address voter, uint candidateId);

    // Phát ra khi owner thêm một ứng viên mới (bổ trợ quản trị)
    event CandidateAdded(uint candidateId, string name);

    // 4. Modifier kiểm soát quyền hạn
    // Chỉ cho phép owner thực thi hàm
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    /**
     * @notice Khởi tạo contract, thiết lập người deploy làm owner.
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Admin (owner) tạo ứng viên mới và đưa vào danh sách.
     * @dev Chỉ owner mới có quyền gọi hàm này nhờ modifier onlyOwner.
     * @param _name Tên của ứng viên cần thêm.
     */
    function addCandidate(string memory _name) public onlyOwner {
        // Kiểm tra tên ứng viên không được để trống
        require(bytes(_name).length > 0, "Candidate name cannot be empty");

        // Tăng biến đếm ID ứng viên
        candidatesCount++;

        // Lưu thông tin ứng viên vào mapping với ID tương ứng
        candidates[candidatesCount] = Candidate({name: _name, voteCount: 0});

        // Ghi nhận sự kiện thêm ứng viên
        emit CandidateAdded(candidatesCount, _name);
    }

    /**
     * @notice Người dùng thực hiện bỏ phiếu cho 1 ứng viên theo candidateId.
     * @dev Mỗi địa chỉ ví chỉ được bỏ phiếu duy nhất 1 lần.
     *      Áp dụng quy tắc Checks-Effects-Interactions (CEI).
     * @param _candidateId Mã định danh (ID) của ứng viên muốn bình chọn.
     */
    function vote(uint _candidateId) public {
        // Check 1: Kiểm tra người dùng chưa từng bỏ phiếu trước đó
        require(!hasVoted[msg.sender], "You have already voted");

        // Check 2: Kiểm tra ID ứng viên có hợp lệ và tồn tại trong danh sách
        require(
            _candidateId > 0 && _candidateId <= candidatesCount,
            "Invalid candidate ID"
        );

        // Effect 1: Đánh dấu địa chỉ ví đã bỏ phiếu (tránh re-entrancy / double voting)
        hasVoted[msg.sender] = true;

        // Effect 2: Tăng số lượng phiếu bầu cho ứng viên
        candidates[_candidateId].voteCount++;

        // Interaction / Log: Phát sự kiện ghi nhận lượt bỏ phiếu thành công
        emit Voted(msg.sender, _candidateId);
    }

    /**
     * @notice Lấy thông tin chi tiết của một ứng viên theo ID.
     * @param _candidateId Mã ID của ứng viên.
     * @return name Tên của ứng viên.
     * @return voteCount Tổng số phiếu bầu ứng viên đã nhận được.
     */
    function getCandidate(
        uint _candidateId
    ) public view returns (string memory name, uint voteCount) {
        require(
            _candidateId > 0 && _candidateId <= candidatesCount,
            "Invalid candidate ID"
        );
        Candidate memory c = candidates[_candidateId];
        return (c.name, c.voteCount);
    }

    /**
     * @notice Kiểm tra nhanh một địa chỉ ví đã tham gia bỏ phiếu hay chưa.
     * @param _voter Địa chỉ ví cần kiểm tra.
     * @return bool Trả về true nếu đã vote, false nếu chưa.
     */
    function checkIfVoted(address _voter) public view returns (bool) {
        return hasVoted[_voter];
    }
}
