// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.6;

contract NonPayable {
    // solhint-disable-next-line no-empty-blocks, payable-fallback
    fallback() external {}
}
