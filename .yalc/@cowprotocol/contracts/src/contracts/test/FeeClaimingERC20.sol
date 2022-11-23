// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

contract FeeClaimingERC20 is ERC20PresetMinterPauser {
    // solhint-disable-next-line no-empty-blocks
    constructor() ERC20PresetMinterPauser("FEE", "FEE") {}

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        uint256 finalAmount = (amount * 99) / 100;
        uint256 burnAmount = amount - finalAmount;

        super._transfer(sender, recipient, finalAmount);
        super._burn(sender, burnAmount);
    }
}
