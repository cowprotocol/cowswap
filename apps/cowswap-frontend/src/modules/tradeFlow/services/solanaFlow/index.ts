import { captureError, ERROR_TYPES, normalizeError } from '@cowprotocol/common-utils'
import { OrderClass, OrderKind, OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency, CurrencyAmount, Token } from '@cowprotocol/currency'
import type { SolanaSwapOrder } from '@cowprotocol/sdk-trading-solana'
import type { UiOrderType } from '@cowprotocol/types'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { emitPostedOrderEvent } from 'modules/orders'
import { planCreateOrderStep, planDelegateStep, planWrapStep, sendSolanaFlow, SolanaFlowStep } from 'modules/trade'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { TradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'

import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

import { SolanaTradeFlowContext } from '../../types/TradeFlowContext'

// eslint-disable-next-line max-lines-per-function
export async function solanaFlow(
  input: SolanaTradeFlowContext,
  analytics: TradeFlowAnalytics,
): Promise<boolean | void> {
  const {
    tradeConfirmActions,
    tradeQuote,
    solanaQuote,
    context,
    callbacks,
    swapFlowAnalyticsContext,
    account,
    solana,
    sellToken,
    sellAmount,
    currentDelegation,
    delegationAmount,
    isNativeSell,
  } = input
  const { inputAmount, outputAmount, chainId, validTo, receiver, orderKind } = context
  const tradeAmounts = { inputAmount, outputAmount }

  logTradeFlow('SOLANA FLOW', 'STEP 1: sign and send wrap, delegate and create-order in one transaction')
  tradeConfirmActions.onSign(tradeAmounts)
  analytics.trade(swapFlowAnalyticsContext)

  try {
    const sellSymbol = inputAmount.currency.symbol ?? 'token'
    const buySymbol = outputAmount.currency.symbol ?? 'token'
    const { owner, connection, provider } = solana

    const {
      step: createOrderStep,
      orderId,
      signingScheme,
    } = await planCreateOrderStep({
      quoteResults: input.tradeQuote.quoteResults,
      solanaQuote,
      sellSymbol,
      buySymbol,
      validTo,
    })

    // Wrap only applies to a native SOL sell and delegate only when the existing delegation is short —
    // both plan functions return null otherwise, so the transaction carries the minimum instructions.
    // `isNativeSell` reflects the user's actual selection, not `inputAmount.currency` — the Solana quote
    // always reports its sellToken as WSOL for a native sell (see `getSolanaSellToken`), so checking
    // `inputAmount.currency` here would skip the wrap step for every native-SOL trade.
    const steps = [
      planWrapStep({ owner, sellAmount: isNativeSell ? sellAmount : 0n }),
      planDelegateStep({ owner, token: sellToken, amount: delegationAmount, currentDelegation }),
      createOrderStep,
    ].filter((step): step is SolanaFlowStep => step !== null)

    const { hash } = await sendSolanaFlow(
      { connection, provider, owner, addTransaction: callbacks.addTransaction },
      steps,
    )

    addPendingOrderStep(
      {
        id: orderId,
        chainId,
        order: buildSolanaOrder({
          orderId,
          txHash: hash,
          signingScheme,
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

    emitSolanaPostedOrderEvent({
      chainId,
      orderId,
      account,
      orderKind,
      uiOrderType: swapFlowAnalyticsContext.orderType,
      receiver,
      inputAmount,
      outputAmount,
      txHash: hash,
    })

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
  signingScheme: SolanaSwapOrder['signingScheme']
  account: string
  quoteParams: OrderParameters
  receiver: string
  validTo: number
  inputToken: Token
  outputToken: Token
}): Order {
  const { orderId, txHash, signingScheme, account, quoteParams, receiver, validTo, inputToken, outputToken } = params

  return {
    ...quoteParams,
    // Override the quote's own receiver/validTo: the quote carries its own TTL rather than the user's
    // deadline, and may be a moment stale. `planCreateOrderStep` applies the same `validTo` to the
    // instruction, so the deadline shown here is the one the on-chain order actually has.
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
    // The order is created on-chain by the transaction above; there is no off-chain signature to carry.
    signature: txHash,
  }
}

// Drives the rich "Order submitted" snackbar (OrderNotification); without this, the fallback
// transaction-added toast shows the raw bundled tx summary instead (e.g. "Swap USDC for SOL").
function emitSolanaPostedOrderEvent(params: {
  chainId: SupportedChainId
  orderId: string
  account: string
  orderKind: OrderKind
  uiOrderType: UiOrderType
  receiver: string
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  txHash: string
}): void {
  const { chainId, orderId, account, orderKind, uiOrderType, receiver, inputAmount, outputAmount, txHash } = params

  emitPostedOrderEvent({
    chainId,
    id: orderId,
    owner: account,
    kind: orderKind,
    uiOrderType,
    receiver,
    inputAmount,
    outputAmount,
    orderCreationHash: txHash,
  })
}
