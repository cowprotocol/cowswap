// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../GPv2Settlement.sol";

/// @title Gnosis Protocol v2 Trade Simulator
/// @author Gnosis Developers
contract GPv2TradeSimulator {
    using GPv2Transfer for IVault;
    using SafeCast for int256;
    using SafeCast for uint256;

    /// @dev A trade to simulate.
    struct Trade {
        address owner;
        address receiver;
        IERC20 sellToken;
        IERC20 buyToken;
        uint256 sellAmount;
        uint256 buyAmount;
        bytes32 sellTokenBalance;
        bytes32 buyTokenBalance;
    }

    /// @dev Initial token state used internally for computing balance changes.
    struct TokenState {
        IERC20 token;
        address account;
        uint256 initialBalance;
    }

    /// @dev Account state for tracking individual token states per user.
    struct AccountState {
        TokenState sellTokenState;
        TokenState buyTokenState;
    }

    /// @dev Simulation context.
    struct Context {
        uint256 gasCounter;
        GPv2Transfer.Data[] inTransfers;
        GPv2Transfer.Data[] outTransfers;
        AccountState contractAccount;
        AccountState ownerAccount;
    }

    /// @dev Account balance changes included in the results.
    struct BalanceDelta {
        int256 sellTokenDelta;
        int256 buyTokenDelta;
    }

    /// @dev Simulation result.
    struct Result {
        uint256 gasUsed;
        uint256 executedBuyAmount;
        BalanceDelta contractBalance;
        BalanceDelta ownerBalance;
    }

    /// @dev Sentinal value to indicate that the buy amount for the trade's out
    /// transfer should use all received buy tokens from the interactions
    /// specified for the simulation.
    uint256 private constant USE_ALL_RECEIVED_BUY_TOKENS = 0;

    /// @dev Simulates a user trade.
    ///
    /// This method can be used to determine whether or not a token is supported
    /// as well as getting a rough estimate on how much gas is required to
    /// execute the trade given a set of interactions.
    ///
    /// One notable difference, is the simulation doesn't actually require an
    /// order. This makes using this method inaccurate for predicting gas usage
    /// for specific trades. However, seeing as computing trade executions is
    /// completely independent of external contracts (i.e. it does not depend on
    /// the tokens being traded or the interactions being executed) the gas
    /// consumption should be off by a predicatable amount.
    ///
    /// @param trade The trade to simulate.
    /// @param interactions A set of interactions to settle the trade against.
    function simulateTrade(
        Trade calldata trade,
        GPv2Interaction.Data[][3] calldata interactions
    ) external returns (Result memory result) {
        Context memory context = createContext(trade);
        GPv2Settlement self = GPv2Settlement(payable(address(this)));

        executeInteractions(interactions[0]);

        self.vaultRelayer().transferFromAccounts(context.inTransfers);

        executeInteractions(interactions[1]);

        updateOutTransferAmount(context);
        self.vault().transferToAccounts(context.outTransfers);

        executeInteractions(interactions[2]);

        finalizeResult(context, result);
    }

    /// @dev Executes interactions.
    function executeInteractions(GPv2Interaction.Data[] calldata interactions)
        private
    {
        for (uint256 i; i < interactions.length; i++) {
            GPv2Interaction.execute(interactions[i]);
        }
    }

    /// @dev Initializes a simulation context in memory for the current trade
    /// simulation.
    ///
    /// This helps organize simulation data and work around "stack too deep"
    /// Solidity errors.
    function createContext(Trade calldata trade)
        private
        view
        returns (Context memory context)
    {
        context.gasCounter = gasleft();

        address actualReceiver = trade.receiver ==
            GPv2Order.RECEIVER_SAME_AS_OWNER
            ? trade.owner
            : trade.receiver;

        context.inTransfers = new GPv2Transfer.Data[](1);
        {
            GPv2Transfer.Data memory inTransfer = context.inTransfers[0];
            inTransfer.account = trade.owner;
            inTransfer.token = trade.sellToken;
            inTransfer.amount = trade.sellAmount;
            inTransfer.balance = trade.sellTokenBalance;
        }

        context.outTransfers = new GPv2Transfer.Data[](1);
        {
            GPv2Transfer.Data memory outTransfer = context.outTransfers[0];
            outTransfer.account = actualReceiver;
            outTransfer.token = trade.buyToken;
            outTransfer.amount = trade.buyAmount;
            outTransfer.balance = trade.buyTokenBalance;
        }

        {
            AccountState memory contractAccount = context.contractAccount;
            initializeTokenState(
                contractAccount.sellTokenState,
                trade.sellToken,
                address(this)
            );
            initializeTokenState(
                contractAccount.buyTokenState,
                trade.buyToken,
                address(this)
            );
        }

        {
            AccountState memory ownerAccount = context.ownerAccount;
            initializeTokenState(
                ownerAccount.sellTokenState,
                trade.sellToken,
                trade.owner
            );
            initializeTokenState(
                ownerAccount.buyTokenState,
                trade.buyToken,
                actualReceiver
            );
        }
    }

    /// @dev Updates the out transfer token amount to be the exact amount of buy
    /// token that has been received so far if the trade simulation was done
    /// using a special sentinal values for the buy amount.
    function updateOutTransferAmount(Context memory context) private view {
        GPv2Transfer.Data memory outTransfer = context.outTransfers[0];
        if (outTransfer.amount == USE_ALL_RECEIVED_BUY_TOKENS) {
            outTransfer.amount = computeTokenDelta(
                context.contractAccount.buyTokenState
            ).toUint256();
        }
    }

    /// @dev Computes the simulation result for the given context.
    function finalizeResult(Context memory context, Result memory result)
        private
        view
    {
        result.executedBuyAmount = context.outTransfers[0].amount;
        computeBalanceDelta(context.contractAccount, result.contractBalance);
        computeBalanceDelta(context.ownerAccount, result.ownerBalance);
        result.gasUsed = context.gasCounter - gasleft();
    }

    /// @dev Initializes a token state for the specified token and address
    function initializeTokenState(
        TokenState memory state,
        IERC20 token,
        address account
    ) private view {
        state.token = token;
        state.account = account;
        state.initialBalance = token.balanceOf(account);
    }

    /// @dev Computes the account's balance delta for all tokens.
    function computeBalanceDelta(
        AccountState memory state,
        BalanceDelta memory result
    ) private view {
        result.sellTokenDelta = computeTokenDelta(state.sellTokenState);
        result.buyTokenDelta = computeTokenDelta(state.buyTokenState);
    }

    /// @dev Computes the token balance delta for the specified token state.
    function computeTokenDelta(TokenState memory state)
        private
        view
        returns (int256)
    {
        uint256 currentBalance = state.token.balanceOf(state.account);
        return currentBalance.toInt256() - state.initialBalance.toInt256();
    }
}
