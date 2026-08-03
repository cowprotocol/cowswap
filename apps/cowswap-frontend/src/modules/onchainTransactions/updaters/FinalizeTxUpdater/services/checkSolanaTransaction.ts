import { Command } from '@cowprotocol/types'

import ms from 'ms.macro'

import { checkedTransaction, finalizeTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

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

function getLastValidBlockHeight(transaction: EnhancedTransactionDetails): number | undefined {
  const value = (transaction.data as { lastValidBlockHeight?: unknown } | undefined)?.lastValidBlockHeight

  return typeof value === 'number' ? value : undefined
}
