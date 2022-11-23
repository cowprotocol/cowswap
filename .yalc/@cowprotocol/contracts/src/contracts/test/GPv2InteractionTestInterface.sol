// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../libraries/GPv2Interaction.sol";

contract GPv2InteractionTestInterface {
    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    function executeTest(GPv2Interaction.Data calldata interaction) external {
        GPv2Interaction.execute(interaction);
    }

    function selectorTest(GPv2Interaction.Data calldata interaction)
        external
        pure
        returns (bytes4)
    {
        return GPv2Interaction.selector(interaction);
    }
}
