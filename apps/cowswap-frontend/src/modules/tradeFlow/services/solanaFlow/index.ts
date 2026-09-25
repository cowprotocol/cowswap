import { captureError, ERROR_TYPES, getCurrencyAddress, normalizeError } from '@cowprotocol/common-utils'
import { OrderClass, OrderKind, OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency, CurrencyAmount, Token } from '@cowprotocol/currency'
import type { SolanaOrderIntent, SolanaSwapOrder } from '@cowprotocol/sdk-trading-solana'
import { postSolanaSponsoredOrder } from '@cowprotocol/sdk-trading-solana'
import type { UiOrderType } from '@cowprotocol/types'

import { PublicKey } from '@solana/web3.js'
import { orderBookApi } from 'cowSdk'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { emitPostedOrderEvent } from 'modules/orders'
import {
  planCreateBuyAtaStep,
  planCreateLimitOrderStep,
  planCreateOrderStep,
  planDelegateStep,
  planWrapStep,
  sendSolanaFlow,
  signSolanaFlow,
  type SignSolanaFlowContext,
  SolanaFlowStep,
} from 'modules/trade'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { TradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'

import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

import { SolanaTradeFlowContext } from '../../types/TradeFlowContext'

// eslint-disable-next-line max-lines-per-function,complexity
export async function solanaFlow(
  input: SolanaTradeFlowContext,
  analytics: TradeFlowAnalytics,
  isSponsored = false,
): Promise<boolean | void> {
  const {
    tradeConfirmActions,
    tradeQuote,
    solanaQuote,
    context,
    callbacks,
    tradeFlowAnalyticsContext,
    account,
    solana,
    sellToken,
    sellAmount,
    currentDelegation,
    delegationAmount,
    isNativeSell,
  } = input
  const { inputAmount, outputAmount, chainId, validTo, receiver, orderKind, orderClass, partiallyFillable } = context
  const tradeAmounts = { inputAmount, outputAmount }

  logTradeFlow('SOLANA FLOW', 'STEP 1: sign and send wrap, delegate, buy-ATA and create-order in one transaction')
  tradeConfirmActions.onSign(tradeAmounts)
  analytics.trade(tradeFlowAnalyticsContext)

  try {
    const sellSymbol = inputAmount.currency.symbol ?? 'token'
    const buySymbol = outputAmount.currency.symbol ?? 'token'
    const { owner, connection, provider } = solana

    const buyAtaReceiver = new PublicKey(
      orderClass === OrderClass.LIMIT ? receiver : (tradeQuote.quoteResults.tradeParameters.receiver ?? receiver),
    )

    // The funder comes from the quote, never pinned here: the back end rotates it, and a stale address
    // is rejected as `WrongFeePayer`. A deployment without sponsoring reports none, which leaves the
    // owner paying — the only thing it can do there.
    //
    // A sponsored order is meant to cost the owner nothing, so every account the bundle creates is
    // rented by the sponsor too. The order book allows that; only the wrap transfer has to stay the
    // owner's, since those are the funds being wrapped.
    const sponsor = isSponsored ? solanaQuote.funder : undefined
    const rentPayer = sponsor ?? owner

    const {
      step: createOrderStep,
      orderId,
      signingScheme,
      feePayer,
      appData: signedAppData,
      sellAmount: signedSellAmount,
      buyAmount: signedBuyAmount,
    } = orderClass === OrderClass.LIMIT
      ? await planCreateLimitOrderStep({
          ownerAddress: account,
          receiverAddress: receiver,
          sellTokenAddress: getCurrencyAddress(inputAmount.currency),
          buyTokenAddress: getCurrencyAddress(outputAmount.currency),
          sellAmount: BigInt(inputAmount.quotient.toString()),
          buyAmount: BigInt(outputAmount.quotient.toString()),
          kind: orderKind,
          validTo,
          partiallyFillable,
          sellSymbol,
          buySymbol,
        })
      : await planCreateOrderStep({
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
      planWrapStep({ owner, rentPayer, sellAmount: isNativeSell ? sellAmount : 0n }),
      planDelegateStep({ owner, token: sellToken, amount: delegationAmount, currentDelegation }),
      planCreateBuyAtaStep({ payer: rentPayer, receiver: buyAtaReceiver, quote: solanaQuote, buySymbol }),
      createOrderStep,
    ].filter((step): step is SolanaFlowStep => step !== null)

    // A sponsored bundle is signed and handed over, never broadcast here, so it yields no signature to
    // track: the order book submits it once it has countersigned as fee payer.
    const txHash = sponsor
      ? await postSponsoredBundle({ connection, provider, feePayer }, steps, tradeQuote.quoteResults)
      : (await sendSolanaFlow({ connection, provider, owner, addTransaction: callbacks.addTransaction }, steps)).hash

    addPendingOrderStep(
      {
        id: orderId,
        chainId,
        order: buildSolanaOrder({
          orderId,
          txHash,
          signingScheme,
          account,
          quoteParams: tradeQuote.quoteResults.quoteResponse.quote,
          signedAmounts: { sellAmount: signedSellAmount, buyAmount: signedBuyAmount },
          receiver,
          validTo,
          orderClass,
          appData: signedAppData,
          inputToken: inputAmount.currency as Token,
          outputToken: outputAmount.currency as Token,
          partiallyFillable,
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
      uiOrderType: tradeFlowAnalyticsContext.orderType,
      receiver,
      inputAmount,
      outputAmount,
      txHash,
    })

    logTradeFlow('SOLANA FLOW', 'STEP 2: show UI of the successfully sent transaction', orderId)
    // onSuccess takes the order id, not the tx hash: OrderSubmittedContent looks the order up
    // from Redux by this value via `useOrder({ id: transactionHash })`.
    tradeConfirmActions.onSuccess(orderId)
    analytics.sign(tradeFlowAnalyticsContext)
    callbacks.closeModals()

    return true
  } catch (err: unknown) {
    const error = normalizeError(err)
    logTradeFlow('SOLANA FLOW', 'STEP 3: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error, chainId)

    captureError(error, ERROR_TYPES.ON_SWAP, { swapErrorMessage })
    analytics.error(error, swapErrorMessage, tradeFlowAnalyticsContext)

    tradeConfirmActions.onError(swapErrorMessage)
  }
}

function buildSolanaOrder(params: {
  orderId: string
  txHash?: string
  signingScheme: SolanaSwapOrder['signingScheme']
  account: string
  quoteParams: OrderParameters
  signedAmounts: Pick<SolanaOrderIntent, 'sellAmount' | 'buyAmount'>
  receiver: string
  validTo: number
  orderClass: OrderClass
  appData: string
  inputToken: Token
  outputToken: Token
  partiallyFillable: boolean
}): Order {
  const { orderId, txHash, signingScheme, account, quoteParams, signedAmounts, receiver, validTo, orderClass } = params
  const { appData, inputToken, outputToken, partiallyFillable } = params

  const sellAmount = signedAmounts.sellAmount.toString()
  const buyAmount = signedAmounts.buyAmount.toString()

  return {
    ...quoteParams,
    // The quote's own amounts are pre-slippage; the on-chain intent carries the amounts that were
    // actually signed. Displaying the quote here would show the user a limit price their order doesn't have.
    sellAmount,
    buyAmount,
    // Override the quote's own receiver/validTo: the quote carries its own TTL rather than the user's
    // deadline, and may be a moment stale. `planCreateOrderStep` applies the same `validTo` to the
    // instruction, so the deadline shown here is the one the on-chain order actually has.
    receiver,
    validTo,
    // Override the quote's own appData: it's a meaningless constant stub for Solana (getSolanaQuote.ts's
    // ZERO_APP_DATA) — this is what was actually signed, and getUiOrderType reads exactly this field to
    // tell a limit order apart from a market one (Solana has no real appData-doc convention to decode).
    appData,
    // Override the quote's own partiallyFillable: it isn't part of the quote request, so the quote
    // response says nothing about what the user actually chose to sign (see getSolanaQuote.ts).
    partiallyFillable,
    id: orderId,
    owner: account,
    from: account,
    inputToken,
    outputToken,
    class: orderClass,
    status: OrderStatus.CREATING,
    creationTime: new Date().toISOString(),
    orderCreationHash: txHash,
    // Solana orders carry no fee (`feeAmount` is always '0'), so this is the signed sell amount too.
    sellAmountBeforeFee: sellAmount,
    signingScheme,
    // The order is created on-chain, so there is no off-chain signature to carry. A sponsored bundle has
    // no local signature either, and `signature` is required — its uid is the only identity available.
    signature: txHash ?? orderId,
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
  txHash?: string
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

/**
 * Signs the bundle without broadcasting and hands it to the order book, which pays for it. Returns
 * nothing to track on chain: the signature only exists once the order book submits, so the order is
 * followed by its uid from here on.
 */
async function postSponsoredBundle(
  context: SignSolanaFlowContext,
  steps: SolanaFlowStep[],
  quoteResults: SolanaTradeFlowContext['tradeQuote']['quoteResults'],
): Promise<undefined> {
  const { transaction } = await signSolanaFlow(context, steps)

  await postSolanaSponsoredOrder(
    // The endpoint answers `id: null` when it could not store the quote, which the type does not admit.
    { transaction, quoteId: quoteResults.quoteResponse.id ?? undefined },
    { orderBookApi },
  )

  return undefined
}
