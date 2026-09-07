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
  const { inputAmount, outputAmount, chainId } = context
  const tradeAmounts = { inputAmount, outputAmount }

  logTradeFlow('SOLANA FLOW', 'STEP 1: sign and post order')
  tradeConfirmActions.onSign(tradeAmounts)
  analytics.trade(swapFlowAnalyticsContext)

  try {
    const { orderId, txHash, signingScheme, signature } = await tradeQuote.postSwapOrderFromQuote()

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
          inputToken: inputAmount.currency as Token,
          outputToken: outputAmount.currency as Token,
        }),
        isSafeWallet: false,
      },
      callbacks.dispatch,
    )

    logTradeFlow('SOLANA FLOW', 'STEP 2: show UI of the successfully sent transaction', orderId)
    tradeConfirmActions.onSuccess(txHash)
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
  inputToken: Token
  outputToken: Token
}): Order {
  const { orderId, txHash, signingScheme, signature, account, quoteParams, inputToken, outputToken } = params

  return {
    ...quoteParams,
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
