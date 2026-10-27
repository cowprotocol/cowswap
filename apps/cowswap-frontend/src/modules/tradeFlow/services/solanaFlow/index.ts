import { captureError, ERROR_TYPES, getCurrencyAddress, normalizeError } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { OrderClass, OrderKind, OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency, CurrencyAmount, Token } from '@cowprotocol/currency'
import type { SolanaOrderIntent, SolanaSwapOrder } from '@cowprotocol/sdk-trading-solana'
import { postSolanaSponsoredOrder } from '@cowprotocol/sdk-trading-solana'
import type { UiOrderType } from '@cowprotocol/types'

import { PublicKey } from '@solana/web3.js'
import { orderBookApi } from 'cowSdk'
import {
  solanaOrderNotPlacedAtom,
  solanaSigningAbandonedAtom,
  solanaSigningDeadlineAtom,
  SolanaSigningDeadlineState,
  solanaSigningWindowExpiredAtom,
} from 'entities/trade'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { emitPostedOrderEvent } from 'modules/orders'
import {
  estimateSolanaSigningDeadline,
  getIsBuyAtaCreationSkipped,
  getSigningWindowClosedError,
  planCreateBuyAtaStep,
  planCreateLimitOrderStep,
  planCreateOrderStep,
  planDelegateStep,
  planWrapStep,
  sendSolanaFlow,
  SigningWindowClosedError,
  signSolanaFlow,
  type SignSolanaFlowContext,
  SolanaFlowStep,
  tradeConfirmStateAtom,
} from 'modules/trade'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { TradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'

import {
  getSwapErrorMessage,
  isBlockhashExpiredError,
  USER_SWAP_REJECTED_ERROR,
} from 'common/utils/getSwapErrorMessage'

import { getSolanaErrorLogs } from './getSolanaErrorLogs'

import { SolanaTradeFlowContext } from '../../types/TradeFlowContext'

// An unanswered wallet prompt keeps its flow pending forever, so a retry runs alongside it: only the
// newest run may touch the confirm-screen state, and every stale one goes silent.
let latestAttemptId = 0

export interface SolanaFlowOptions {
  isSponsored?: boolean
  /** LaunchDarkly `isAtaCreationDisabled`: the driver creates the buy token account at settle instead. */
  isAtaCreationDisabled?: boolean
}

// eslint-disable-next-line max-lines-per-function,complexity
export async function solanaFlow(
  input: SolanaTradeFlowContext,
  analytics: TradeFlowAnalytics,
  { isSponsored = false, isAtaCreationDisabled = false }: SolanaFlowOptions = {},
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
  const attemptId = ++latestAttemptId
  // A previous attempt can hang forever on an unanswered wallet prompt, which leaves its (expired)
  // deadline behind — without this reset the new attempt opens straight onto a 00:00 countdown.
  jotaiStore.set(solanaSigningDeadlineAtom, null)
  jotaiStore.set(solanaSigningAbandonedAtom, false)
  jotaiStore.set(solanaSigningWindowExpiredAtom, null)
  jotaiStore.set(solanaOrderNotPlacedAtom, null)
  tradeConfirmActions.onSign(tradeAmounts)
  analytics.trade(tradeFlowAnalyticsContext)

  // Flipped the moment the transaction leaves for the network, so the error handling below can tell
  // a failure that definitely placed nothing from one whose outcome is unknown.
  let isSubmissionStarted = false

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
    // A sponsored order covers the fees and rents the accounts the order itself needs. The WSOL
    // account a native sell opens is not one of them: it is the owner's own account, and closing it
    // returns the rent to the owner, so a sponsor-funded one would be a standing withdrawal from the
    // sponsor. Both the wrap's rent and its transfer therefore stay the owner's.
    const sponsor = isSponsored ? solanaQuote.funder : undefined
    const buyAtaRentPayer = sponsor ?? owner

    const {
      step: createOrderStep,
      orderId,
      signingScheme,
      appData: signedAppData,
      sellAmount: signedSellAmount,
      buyAmount: signedBuyAmount,
      feePayer,
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
          sponsor,
        })

    // Wrap only applies to a native SOL sell and delegate only when the existing delegation is short —
    // both plan functions return null otherwise, so the transaction carries the minimum instructions.
    // `isNativeSell` reflects the user's actual selection, not `inputAmount.currency` — the Solana quote
    // always reports its sellToken as WSOL for a native sell (see `getSolanaSellToken`), so checking
    // `inputAmount.currency` here would skip the wrap step for every native-SOL trade.
    const steps = [
      planWrapStep({ owner, sellAmount: isNativeSell ? sellAmount : 0n }),
      planDelegateStep({ owner, token: sellToken, amount: delegationAmount, currentDelegation }),
      planCreateBuyAtaStep({
        payer: buyAtaRentPayer,
        receiver: buyAtaReceiver,
        quote: solanaQuote,
        buySymbol,
        isCreationSkipped: getIsBuyAtaCreationSkipped({ quote: solanaQuote, owner, isAtaCreationDisabled }),
      }),
      createOrderStep,
    ].filter((step): step is SolanaFlowStep => step !== null)

    // A sponsored bundle is signed and handed over, never broadcast here, so it yields no signature to
    // track: the order book submits it once it has countersigned as fee payer.
    const txHash = sponsor
      ? await postSponsoredBundle(
          { connection, provider, feePayer },
          steps,
          tradeQuote.quoteResults,
          () => attemptId === latestAttemptId,
          () => {
            isSubmissionStarted = true
          },
        )
      : (await sendSolanaFlow({ connection, provider, owner, addTransaction: callbacks.addTransaction }, steps)).hash

    // Self-paid sends broadcast inside the wallet call above, so reaching here means it went out.
    isSubmissionStarted = true

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
          isSponsored: sponsor !== undefined,
          isNativeSell,
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

    // The user retried while this attempt's prompt was still open: its screen belongs to the newer
    // run now, and a stale failure must not repaint it.
    if (attemptId !== latestAttemptId) {
      return
    }

    const isRejection = swapErrorMessage === USER_SWAP_REJECTED_ERROR
    const isSigningWindowClosed = jotaiStore.get(solanaSigningAbandonedAtom)

    // Rejecting a prompt whose window already closed is the expected retry path, not an error: back
    // to the review screen (with forced price confirmation), or silence if the modal was left.
    if (isRejection && isSigningWindowClosed) {
      if (jotaiStore.get(tradeConfirmStateAtom).isOpen) {
        tradeConfirmActions.onOpen(true)
      }

      return
    }

    // Three ways to learn the same thing — the blockhash died before the order was placed. The
    // countdown catches it locally, and the order book catches the rest: the hand-over above is
    // deliberately optimistic, so a signature given near the boundary is rejected there instead.
    // The third is a wallet that answered a prompt whose countdown had already run out: whatever
    // it called the failure, the user watched the window close, and that is the part they can act
    // on. Only before the hand-over — afterwards the bundle may still have been taken.
    const isWindowExpiryFailure =
      error instanceof SigningWindowClosedError ||
      isBlockhashExpiredError(error) ||
      (isSigningWindowClosed && !isSubmissionStarted)

    if (isWindowExpiryFailure) {
      jotaiStore.set(solanaSigningWindowExpiredAtom, tradeAmounts)
    } else if (!isSubmissionStarted && !isRejection) {
      // Nothing left the client, so the screen can say outright that no order was placed and keep
      // the wallet's own wording — which is where the unreadable ones come from — out of the way
      // under "technical details". A deliberate rejection is not a failure and keeps its own copy.
      jotaiStore.set(solanaOrderNotPlacedAtom, {
        tradeAmounts,
        errorMessage: swapErrorMessage,
        logs: getSolanaErrorLogs(error),
      })
    }

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
  isSponsored: boolean
  isNativeSell: boolean
}): Order {
  const { orderId, txHash, signingScheme, account, quoteParams, signedAmounts, receiver, validTo, orderClass } = params
  const { appData, inputToken, outputToken, partiallyFillable, isSponsored, isNativeSell } = params

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
    // Override the quote's own buyToken: a native-SOL buy is priced against WSOL (`toSplMint` in
    // getSolanaQuote), while the order names the native sentinel. Readers that compare `buyToken`
    // against `outputToken` — `useGetExecutedBridgeSummary` reads the difference as a bridge
    // intermediate token — otherwise attribute the surplus to WSOL.
    buyToken: outputToken.address,
    isSponsored,
    isNativeSell,
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
 * Signs the bundle without broadcasting and hands it to the order book, which pays for it and
 * submits — so nothing to track on chain here, the order is followed by its uid.
 */
async function postSponsoredBundle(
  context: SignSolanaFlowContext,
  steps: SolanaFlowStep[],
  quoteResults: SolanaTradeFlowContext['tradeQuote']['quoteResults'],
  isCurrentAttempt: () => boolean,
  /** Fired just before the bundle is handed over, after which its outcome is no longer ours to know. */
  onSubmissionStart: () => void,
): Promise<undefined> {
  // By the time a hung attempt settles, the shared atoms may belong to a newer attempt — every
  // write below is gated on the atom still holding this attempt's own value.
  let ownDeadline: SolanaSigningDeadlineState | null = null
  let isSettled = false

  const hasShownWindowClosed = (atMs = Date.now()): boolean => !!ownDeadline && atMs >= ownDeadline.expiresAt

  const settleSigning = (): void => {
    if (isSettled) return
    isSettled = true

    if (!ownDeadline || jotaiStore.get(solanaSigningDeadlineAtom) !== ownDeadline) return

    // The wallet answered after the window closed: lets the error handling route the rejection
    // back to the review screen instead of the error modal.
    if (hasShownWindowClosed()) {
      jotaiStore.set(solanaSigningAbandonedAtom, true)
    }

    jotaiStore.set(solanaSigningDeadlineAtom, null)
  }

  try {
    const { transaction, signedAtMs } = await signSolanaFlow(
      {
        ...context,
        onDeadline: () => {
          void estimateSolanaSigningDeadline(context.connection).then((deadline) => {
            // Painted only while this attempt still owns the screen and the window is still alive —
            // a stale or pathologically late estimate would otherwise open the countdown onto 00:00.
            if (isSettled || !isCurrentAttempt() || deadline.expiresAt <= Date.now()) return

            ownDeadline = deadline
            jotaiStore.set(solanaSigningDeadlineAtom, deadline)
          })
        },
      },
      steps,
    )

    // Judged by the countdown's own clock, never by a block-height read-back: the load-balanced RPC
    // can answer ~a minute apart between two calls and so declare a seconds-old blockhash dead
    // (false "window closed" with the timer still running). The order book re-checks blockhash
    // liveness itself, so an optimistic hand-over costs one round-trip at worst.
    if (!isCurrentAttempt() || hasShownWindowClosed(signedAtMs)) {
      throw getSigningWindowClosedError()
    }

    // Settled at the signature, not after the POST: the countdown must not keep ticking (and claim
    // the window closed) while the signed bundle is being handed to the order book.
    settleSigning()

    onSubmissionStart()

    await postSolanaSponsoredOrder(
      // The endpoint answers `id: null` when it could not store the quote, which the type does not admit.
      { partiallySignedTx: transaction, quoteId: quoteResults.quoteResponse.id ?? undefined },
      { orderBookApi },
    )
  } finally {
    settleSigning()
  }

  return undefined
}
