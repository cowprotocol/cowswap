import { resolveSolanaReceiver } from './resolveSolanaReceiver'

import { SolanaContextKey } from '../types/SolanaContextKey'
import { SolanaTradeFlowContext } from '../types/TradeFlowContext'

export function buildSolanaTradeFlowContext([
  account,
  chainId,
  tradeQuote,
  inputAmount,
  outputAmount,
  uiOrderType,
  orderKind,
  validTo,
  recipient,
  recipientAddress,
  closeModals,
  dispatch,
  addTransaction,
  tradeConfirmActions,
  solana,
  sellToken,
  currentDelegation,
  delegationAmount,
]: SolanaContextKey): SolanaTradeFlowContext {
  return {
    tradeQuote,
    solanaQuote: tradeQuote.solanaQuote,
    account,
    solana,
    sellToken,
    sellAmount: BigInt(inputAmount.quotient.toString()),
    currentDelegation,
    delegationAmount,
    context: {
      chainId,
      inputAmount,
      outputAmount,
      orderKind,
      validTo,
      receiver: resolveSolanaReceiver({ recipient, recipientAddress, account }),
    },
    callbacks: { closeModals, dispatch, addTransaction },
    tradeConfirmActions,
    swapFlowAnalyticsContext: {
      account,
      recipient,
      recipientAddress,
      marketLabel: [inputAmount.currency.symbol, outputAmount.currency.symbol].join(','),
      orderType: uiOrderType,
      isBridgeOrder: false,
    },
  }
}
