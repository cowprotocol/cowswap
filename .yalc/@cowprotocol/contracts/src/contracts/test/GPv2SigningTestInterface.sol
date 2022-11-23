// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../libraries/GPv2Order.sol";
import "../libraries/GPv2Trade.sol";
import "../mixins/GPv2Signing.sol";

contract GPv2SigningTestInterface is GPv2Signing {
    function recoverOrderFromTradeTest(
        IERC20[] calldata tokens,
        GPv2Trade.Data calldata trade
    ) external view returns (RecoveredOrder memory recoveredOrder) {
        recoveredOrder = allocateRecoveredOrder();
        recoverOrderFromTrade(recoveredOrder, tokens, trade);
    }

    function recoverOrderSignerTest(
        GPv2Order.Data memory order,
        GPv2Signing.Scheme signingScheme,
        bytes calldata signature
    ) external view returns (address owner) {
        (, owner) = recoverOrderSigner(order, signingScheme, signature);
    }
}
