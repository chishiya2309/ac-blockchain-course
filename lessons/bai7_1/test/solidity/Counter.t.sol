// SPDX-License-Identifier: MIT
pragma solidity ^0.8.37;

import {Counter} from "../../contracts/Counter.sol";

contract CounterTest {
    function testInitialCount() external {
        Counter counter = new Counter();
        assert(counter.getCount() == 0);
    }

    function testIncrementTwice() external {
        Counter counter = new Counter();
        counter.increment();
        counter.increment();
        assert(counter.count() == 2);
    }
}
