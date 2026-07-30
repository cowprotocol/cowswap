import { Command } from '@cowprotocol/types'

import { checkedTransaction, finalizeTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

import { emitOnchainTransactionEvent } from '../../../utils/emitOnchainTransactionEvent'
import { CheckEthereumTransactions } from '../types'

import type { Connection } from '@solana/web3.js'

type StatusResult = { type: 'success' | 'reverted'; slot: number } | { type: 'pending' }

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

async function checkStatus(
  connection: Connection | undefined,
  signature: string,
  transaction: EnhancedTransactionDetails,
): Promise<StatusResult> {
  if (!connection) return { type: 'pending' }

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

  return blockHeight > lastValidBlockHeight ? { type: 'reverted', slot: context.slot } : { type: 'pending' }
}

function getLastValidBlockHeight(transaction: EnhancedTransactionDetails): number | undefined {
  const value = (transaction.data as { lastValidBlockHeight?: unknown } | undefined)?.lastValidBlockHeight

  return typeof value === 'number' ? value : undefined
}
