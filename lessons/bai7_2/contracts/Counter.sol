// SPDX-License-Identifier: MIT
pragma solidity ^0.8.37;

/// @title A counter that anyone can increment
contract Counter {
    uint256 public count;

    event CountIncremented(address indexed caller, uint256 newCount);

    function increment() external {
        ++count;
        emit CountIncremented(msg.sender, count);
    }

    function getCount() external view returns (uint256) {
        return count;
    }
}
