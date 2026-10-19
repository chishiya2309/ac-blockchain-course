// SPDX-License-Identifier: MIT
pragma solidity ^0.8.37;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title A fixed-supply ERC20 with the standard 18 decimals
contract ACToken is ERC20 {
    /// @param initialSupply Supply in base units, including all 18 decimal places
    constructor(
        string memory name_,
        string memory symbol_,
        address recipient,
        uint256 initialSupply
    ) ERC20(name_, symbol_) {
        _mint(recipient, initialSupply);
    }
}
