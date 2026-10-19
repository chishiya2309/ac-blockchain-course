// SPDX-License-Identifier: MIT
pragma solidity ^0.8.37;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title An ERC20 whose owner can mint tokens to any nonzero address
contract MyMintableToken is ERC20, Ownable {
    constructor() ERC20("MyMintableToken", "MMT") Ownable(msg.sender) {}

    /// @param to Recipient of the newly minted tokens
    /// @param amount Amount in base units, including all 18 decimal places
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
