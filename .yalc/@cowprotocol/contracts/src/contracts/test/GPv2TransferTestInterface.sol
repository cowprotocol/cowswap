// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../libraries/GPv2Transfer.sol";

contract GPv2TransferTestInterface {
    function fastTransferFromAccountTest(
        IVault vault,
        GPv2Transfer.Data calldata transfer,
        address recipient
    ) external {
        GPv2Transfer.fastTransferFromAccount(vault, transfer, recipient);
    }

    function transferFromAccountsTest(
        IVault vault,
        GPv2Transfer.Data[] calldata transfers,
        address recipient
    ) external {
        GPv2Transfer.transferFromAccounts(vault, transfers, recipient);
    }

    function transferToAccountsTest(
        IVault vault,
        GPv2Transfer.Data[] memory transfers
    ) external {
        GPv2Transfer.transferToAccounts(vault, transfers);
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}
}
