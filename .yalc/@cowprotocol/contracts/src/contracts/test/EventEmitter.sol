// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.6;

contract EventEmitter {
    event Event(uint256 value, uint256 number);

    function emitEvent(uint256 number) external payable {
        emit Event(msg.value, number);
    }
}
