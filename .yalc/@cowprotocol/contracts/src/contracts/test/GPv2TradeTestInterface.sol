// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../libraries/GPv2Order.sol";
import "../libraries/GPv2Trade.sol";

contract GPv2TradeTestInterface {
    function extractOrderTest(
        IERC20[] calldata tokens,
        GPv2Trade.Data calldata trade
    ) external pure returns (GPv2Order.Data memory order) {
        GPv2Trade.extractOrder(trade, tokens, order);
    }

    function extractFlagsTest(uint256 flags)
        external
        pure
        returns (
            bytes32 kind,
            bool partiallyFillable,
            bytes32 sellTokenBalance,
            bytes32 buyTokenBalance,
            GPv2Signing.Scheme signingScheme
        )
    {
        return GPv2Trade.extractFlags(flags);
    }
}
