// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyNFT
 * @dev ERC721 Token với biến nextTokenId và hàm mint dành riêng cho owner
 */
contract MyNFT is ERC721, Ownable {
    // Biến lưu trữ ID tiếp theo sẽ được mint (bắt đầu từ 0)
    uint256 public nextTokenId;

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {}

    /**
     * @dev Mint một NFT mới cho địa chỉ `to`. Chỉ có chủ sở hữu hợp đồng (owner) mới có quyền gọi.
     * Mỗi lần mint sẽ tăng biến `nextTokenId`.
     * @param to Địa chỉ nhận NFT
     */
    function mint(address to) external onlyOwner {
        uint256 tokenId = nextTokenId;
        nextTokenId = tokenId + 1;
        _safeMint(to, tokenId);
    }
}
