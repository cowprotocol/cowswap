import { Command } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'
import { orderBookApi } from 'cowSdk'
import ms from 'ms.macro'

import { checkedTransaction, finalizeTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'
import { invalidateOrdersBatch } from 'legacy/state/orders/actions'
import { isOrderFulfilled, partialOrderUpdate } from 'legacy/state/orders/utils'

import { emitCancelledOrderEvent } from 'modules/orders'

import { emitOnchainTransactionEvent } from '../../../utils/emitOnchainTransactionEvent'
import { CheckEthereumTransactions } from '../types'

import type { Connection } from '@solana/web3.js'

type StatusResult = { type: 'success' | 'reverted'; slot: number } | { type: 'pending' }

/**
 * `searchTransactionHistory` reaches into the RPC provider's own archival index rather than the
 * validator's live ledger, and that archive commonly lags real time by up to a minute or two while a
 * landed transaction is ingested into it. Trusting a single empty result the moment the blockhash
 * expires would misreport a landed-but-not-yet-archived transaction as reverted, so a genuine "not
 * found anywhere" verdict is only trusted once this much real time has passed since submission —
 * comfortably longer than that ingestion lag.
 */
export const HISTORICAL_LOOKUP_GRACE_PERIOD_MS = ms`3m`

/**
 * Solana counterpart to {@link checkOnChainTransaction}.
 *
 * Solana has no receipts, so confirmation is read from the signature status. The awkward part is that
 * `getSignatureStatuses` returns `null` both for "submitted, not landed yet" and for "dropped, will
 * never land" — indistinguishable on their own. The blockhash's `lastValidBlockHeight` resolves the
 * ambiguity: once the chain passes it, the transaction can no longer be included, so a still-unknown
 * signature is permanently lost rather than pending. Without that check a dropped transaction would sit
 * pending forever.
 */
export function checkSolanaTransaction(
  transaction: EnhancedTransactionDetails,
  params: CheckEthereumTransactions,
): Command {
  const { chainId, dispatch, lastBlockNumber, solanaConnection } = params
  const { hash } = transaction

  let isCancelled = false

  const finalize = (status: 'success' | 'reverted', slot: number): void => {
    const receipt = {
      to: null,
      from: transaction.from,
      contractAddress: null,
      transactionIndex: 0,
      blockHash: '',
      transactionHash: hash,
      blockNumber: slot,
      status,
    }

    dispatch(finalizeTransaction({ chainId, hash, receipt }))

    // Like EVM's on-chain cancellation, a cancellation tx has no activity-list entry or completion
    // snackbar of its own on success - the order it cancels (or fails to) carries that instead. Only a
    // failed cancellation gets a snackbar, same as EVM.
    if (transaction.onChainCancellation) {
      const { orderId, sellTokenSymbol } = transaction.onChainCancellation

      if (status === 'success') {
        void finalizeSuccessfulCancellation(orderId, params, hash)
      } else {
        clearCancellingState(orderId, params)
        emitTransactionFailedEvent(transaction, hash, slot, t`Failed to cancel order selling ${sellTokenSymbol}`)
      }

      return
    }

    if (transaction.solanaCancelOrderIds) {
      const orderIds = transaction.solanaCancelOrderIds

      if (status === 'success') {
        orderIds.forEach((orderId) => void finalizeSuccessfulCancellation(orderId, params, hash))
      } else {
        orderIds.forEach((orderId) => clearCancellingState(orderId, params))
        const ordersCount = orderIds.length
        emitTransactionFailedEvent(transaction, hash, slot, t`Failed to cancel ${ordersCount} orders`)
      }

      return
    }

    if (transaction.solanaOrderCreation) {
      const createdOrderId = getCreatedOrderId(transaction)

      // No id means a transaction stored before this field carried one — see `getCreatedOrderId`.
      // There is nothing to fail, and claiming a failure without failing anything would leave the
      // order in `CREATING` under a notification saying it had not been placed.
      if (status === 'reverted' && createdOrderId) {
        failCreatedOrder(createdOrderId, transaction, params, slot)
      }

      return
    }

    emitOnchainTransactionEvent({
      receipt: {
        to: '',
        from: transaction.from,
        contractAddress: '',
        transactionHash: hash as `0x${string}`,
        blockNumber: slot,
        status: status === 'success' ? 1 : 0,
        replacementType: transaction.replacementType,
      },
      summary: transaction.summary || '',
      isSafeTx: false,
    })
  }

  checkStatus(solanaConnection, hash, transaction)
    .then((result) => {
      if (isCancelled) return

      if (result.type === 'pending') {
        dispatch(checkedTransaction({ chainId, hash, blockNumber: lastBlockNumber }))
        return
      }

      finalize(result.type === 'success' ? 'success' : 'reverted', result.slot)
    })
    .catch((error) => {
      if (isCancelled) return

      console.error(`[FinalizeTxUpdater] Failed to get signature status for tx: ${hash}`, error)
      dispatch(checkedTransaction({ chainId, hash, blockNumber: lastBlockNumber }))
    })

  return () => {
    isCancelled = true
  }
}

async function checkHistoricalStatus(
  connection: Connection,
  signature: string,
  transaction: EnhancedTransactionDetails,
  fallbackSlot: number,
): Promise<StatusResult> {
  const { value } = await connection.getSignatureStatuses([signature], { searchTransactionHistory: true })
  const [historicalStatus] = value

  if (historicalStatus) {
    return historicalStatus.err
      ? { type: 'reverted', slot: historicalStatus.slot }
      : { type: 'success', slot: historicalStatus.slot }
  }

  // Still nothing, anywhere — but if we're only just past the blockhash's validity window, the archive
  // may simply not have ingested it yet. Keep waiting until the grace period passes before concluding
  // the transaction was dropped rather than merely not-yet-archived.
  const hasWaitedOutIngestionLag = Date.now() - transaction.addedTime > HISTORICAL_LOOKUP_GRACE_PERIOD_MS

  return hasWaitedOutIngestionLag ? { type: 'reverted', slot: fallbackSlot } : { type: 'pending' }
}

async function checkStatus(
  connection: Connection | undefined,
  signature: string,
  transaction: EnhancedTransactionDetails,
): Promise<StatusResult> {
  if (!connection) return { type: 'pending' }

  // The cheap lookup: consults only the node's recent status cache.
  const { context, value } = await connection.getSignatureStatuses([signature])
  const [status] = value

  if (status) {
    if (status.err) return { type: 'reverted', slot: status.slot }

    const isConfirmed = status.confirmationStatus === 'confirmed' || status.confirmationStatus === 'finalized'

    return isConfirmed ? { type: 'success', slot: status.slot } : { type: 'pending' }
  }

  const lastValidBlockHeight = getLastValidBlockHeight(transaction)

  if (lastValidBlockHeight === undefined) return { type: 'pending' }

  const blockHeight = await connection.getBlockHeight()

  if (blockHeight <= lastValidBlockHeight) return { type: 'pending' }

  // The blockhash has expired and the signature is not in the recent status cache — but that cache only
  // spans ~150 slots, so a transaction that landed and then aged out reads back exactly like one that
  // never landed. Slot polling stops while the tab is hidden, so simply switching away for a minute is
  // enough to miss the window and mistake a confirmed transaction for a failed one.
  //
  // Confirm against transaction history before declaring failure. That lookup is expensive for the node,
  // which is why it is reached only here, once the recent cache is no longer an option.
  return checkHistoricalStatus(connection, signature, transaction, context.slot)
}

function clearCancellingState(orderId: string, params: CheckEthereumTransactions): void {
  const { chainId, isSafeWallet, dispatch } = params

  partialOrderUpdate(
    {
      chainId,
      order: { id: orderId, isCancelling: false, cancellationHash: undefined, cancellationHashTime: undefined },
      isSafeWallet,
    },
    dispatch,
  )
}

function emitTransactionFailedEvent(
  transaction: EnhancedTransactionDetails,
  hash: string,
  slot: number,
  summary: string,
): void {
  emitOnchainTransactionEvent({
    receipt: {
      to: '',
      from: transaction.from,
      contractAddress: '',
      transactionHash: hash as `0x${string}`,
      blockNumber: slot,
      status: 0,
      replacementType: transaction.replacementType,
    },
    summary,
    isSafeTx: false,
  })
}

/**
 * The order lives only in local state until the order book indexes its creation transaction, and the
 * book is never told about one whose transaction died. Nothing else links the two, so without this the
 * order polls for an id that will never resolve and sits in `CREATING` indefinitely — offered as
 * cancellable the whole time, against an order that does not exist on chain.
 */
function failCreatedOrder(
  orderId: string,
  transaction: EnhancedTransactionDetails,
  params: CheckEthereumTransactions,
  slot: number,
): void {
  const { chainId, dispatch, isSafeWallet } = params

  dispatch(invalidateOrdersBatch({ chainId, ids: [orderId], isSafeWallet }))
  // Not `transaction.summary`, which reads as the steps the transaction bundled: what the user needs
  // to know is that the order did not get placed.
  emitTransactionFailedEvent(transaction, transaction.hash, slot, t`Failed to place order`)
}

/**
 * A solver's fill can land around the same time as the cancellation. Check the order-book before
 * marking the order cancelled so one that's actually fulfilled never flashes "Cancelled" - leave it
 * alone and let the normal fulfilled-order detection pick it up instead.
 */
async function finalizeSuccessfulCancellation(
  orderId: string,
  params: CheckEthereumTransactions,
  hash: string,
): Promise<void> {
  const { chainId, isSafeWallet, cancelOrdersBatch } = params
  const order = await orderBookApi.getOrderMultiEnv(orderId, { chainId })

  if (!order || isOrderFulfilled(order)) return

  cancelOrdersBatch({ chainId, ids: [orderId], isSafeWallet })
  emitCancelledOrderEvent({ chainId, order, transactionHash: hash })
}

/**
 * Transactions are persisted to local storage, and before the id was added this field was a plain
 * `true`. One stored by an older build therefore still reads as truthy while carrying no id, so the
 * shape is checked rather than trusted.
 */
function getCreatedOrderId(transaction: EnhancedTransactionDetails): string | undefined {
  const value: unknown = transaction.solanaOrderCreation

  if (typeof value !== 'object' || value === null) return undefined

  const { orderId } = value as { orderId?: unknown }

  return typeof orderId === 'string' ? orderId : undefined
}

function getLastValidBlockHeight(transaction: EnhancedTransactionDetails): number | undefined {
  const value = (transaction.data as { lastValidBlockHeight?: unknown } | undefined)?.lastValidBlockHeight

  return typeof value === 'number' ? value : undefined
}
