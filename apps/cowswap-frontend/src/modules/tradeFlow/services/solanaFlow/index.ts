import { captureError, ERROR_TYPES, normalizeError } from '@cowprotocol/common-utils'
import { OrderClass, OrderParameters } from '@cowprotocol/cow-sdk'
import type { Token } from '@cowprotocol/currency'

import { t } from '@lingui/core/macro'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { TradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'

import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

import { SolanaTradeFlowContext } from '../../types/TradeFlowContext'

export async function solanaFlow(
  input: SolanaTradeFlowContext,
  analytics: TradeFlowAnalytics,
): Promise<boolean | void> {
  const { tradeConfirmActions, tradeQuote, context, callbacks, swapFlowAnalyticsContext, account } = input
  const { inputAmount, outputAmount, chainId, validTo, receiver } = context
  const tradeAmounts = { inputAmount, outputAmount }

  logTradeFlow('SOLANA FLOW', 'STEP 1: sign and post order')
  tradeConfirmActions.onSign(tradeAmounts)
  analytics.trade(swapFlowAnalyticsContext)

  try {
    // Forward the user's configured deadline and any custom recipient set after quoting; otherwise
    // the SDK falls back to the quote's own validTo/receiver, same as swapFlow does for EVM.
    const { orderId, txHash, signingScheme, signature } = await tradeQuote.postSwapOrderFromQuote({
      quoteRequest: { validTo, receiver },
    })

    if (!txHash) {
      throw new Error('Solana order posted without a transaction signature')
    }

    const sellSymbol = inputAmount.currency.symbol ?? 'token'
    const buySymbol = outputAmount.currency.symbol ?? 'token'

    callbacks.addTransaction({
      hash: txHash,
      summary: t`Swap ${sellSymbol} for ${buySymbol}`,
    })

    addPendingOrderStep(
      {
        id: orderId,
        chainId,
        order: buildSolanaOrder({
          orderId,
          txHash,
          signingScheme,
          signature,
          account,
          quoteParams: tradeQuote.quoteResults.quoteResponse.quote,
          receiver,
          validTo,
          inputToken: inputAmount.currency as Token,
          outputToken: outputAmount.currency as Token,
        }),
        isSafeWallet: false,
      },
      callbacks.dispatch,
    )

    logTradeFlow('SOLANA FLOW', 'STEP 2: show UI of the successfully sent transaction', orderId)
    // onSuccess takes the order id, not the tx hash: OrderSubmittedContent looks the order up
    // from Redux by this value via `useOrder({ id: transactionHash })`.
    tradeConfirmActions.onSuccess(orderId)
    analytics.sign(swapFlowAnalyticsContext)
    callbacks.closeModals()

    return true
  } catch (err: unknown) {
    const error = normalizeError(err)
    logTradeFlow('SOLANA FLOW', 'STEP 3: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error, chainId)

    captureError(error, ERROR_TYPES.ON_SWAP, { swapErrorMessage })
    analytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    tradeConfirmActions.onError(swapErrorMessage)
  }
}

function buildSolanaOrder(params: {
  orderId: string
  txHash: string
  signingScheme: Order['signingScheme']
  signature: Order['signature']
  account: string
  quoteParams: OrderParameters
  receiver: string
  validTo: number
  inputToken: Token
  outputToken: Token
}): Order {
  const {
    orderId,
    txHash,
    signingScheme,
    signature,
    account,
    quoteParams,
    receiver,
    validTo,
    inputToken,
    outputToken,
  } = params

  return {
    ...quoteParams,
    // Override the quote's own receiver/validTo: they can be stale by the time the order is
    // actually submitted (see the postSwapOrderFromQuote call above), and the local CREATING
    // order must match what was really posted, not what the quote a moment ago.
    receiver,
    validTo,
    id: orderId,
    owner: account,
    from: account,
    inputToken,
    outputToken,
    class: OrderClass.MARKET,
    status: OrderStatus.CREATING,
    creationTime: new Date().toISOString(),
    orderCreationHash: txHash,
    sellAmountBeforeFee: quoteParams.sellAmount,
    signingScheme,
    signature,
  }
}
