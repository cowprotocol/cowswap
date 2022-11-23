// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/drafts/ERC20Permit.sol";
import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

contract ERC20PresetPermit is ERC20Permit {
    constructor(string memory symbol)
        ERC20(symbol, symbol)
        ERC20Permit(symbol)
    // solhint-disable-next-line no-empty-blocks
    {

    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
