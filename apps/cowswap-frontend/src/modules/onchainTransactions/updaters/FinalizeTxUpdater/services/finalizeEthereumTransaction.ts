import { finalizeTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

import { finalizeEthFlowTx } from './finalizeEthFlowTx'
import { finalizeOnChainCancellation } from './finalizeOnChainCancellation'

import { ONCHAIN_TRANSACTIONS_EVENTS, OnchainTxEvents } from '../../../onchainTransactionsEvents'
import { emitOnchainTransactionEvent } from '../../../utils/emitOnchainTransactionEvent'
import { CheckEthereumTransactions } from '../types'

import type { TransactionReceipt, Hex } from 'viem'

const finalizedEthereumTxDedupeKeys = new Set<string>()

// Track when the current page session started to avoid showing notifications for old transactions on reload
const pageLoadTime = Date.now()

function getEthereumTxFinalizeDedupeKey(chainId: number, receiptTransactionHash: string): string {
  return `${chainId}:${receiptTransactionHash.toLowerCase()}`
}

export function finalizeEthereumTransaction(
  receipt: TransactionReceipt,
  transaction: EnhancedTransactionDetails,
  params: CheckEthereumTransactions,
  safeTransactionHash?: string,
): void {
  const { chainId, dispatch } = params
  const { hash } = transaction

  const dedupeKey = getEthereumTxFinalizeDedupeKey(chainId, receipt.transactionHash)
  if (finalizedEthereumTxDedupeKeys.has(dedupeKey)) {
    return
  }
  finalizedEthereumTxDedupeKeys.add(dedupeKey)

  console.log(`[FinalizeTxUpdater] Transaction ${receipt.transactionHash} has been mined`, receipt, transaction)

  ONCHAIN_TRANSACTIONS_EVENTS.emit(OnchainTxEvents.BEFORE_TX_FINALIZE, { transaction, receipt })

  dispatch(
    finalizeTransaction({
      chainId,
      hash,
      receipt: {
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
        contractAddress: receipt.contractAddress,
        from: receipt.from,
        status: receipt.status,
        to: receipt.to,
        transactionHash: receipt.transactionHash,
        transactionIndex: receipt.transactionIndex,
      },
    }),
  )

  // Skip showing notification for transactions that were added before this page session
  // This prevents duplicate notifications on page reload for already-mined transactions
  const isTransactionFromPreviousSession = transaction.addedTime < pageLoadTime
  const shouldShowNotification = !isTransactionFromPreviousSession

  if (isTransactionFromPreviousSession) {
    console.log(
      `[FinalizeTxUpdater] Skipping notification for transaction ${receipt.transactionHash} - added before page load`,
    )
  }

  if (transaction.ethFlow) {
    finalizeEthFlowTx(transaction, receipt, params, hash, shouldShowNotification)
    return
  }

  if (transaction.onChainCancellation) {
    const { orderId, sellTokenSymbol } = transaction.onChainCancellation

    finalizeOnChainCancellation(transaction, receipt, params, hash, orderId, sellTokenSymbol, shouldShowNotification)
    return
  }

  if (!shouldShowNotification) {
    return
  }

  emitOnchainTransactionEvent({
    receipt: {
      to: receipt.to,
      from: receipt.from,
      contractAddress: receipt.contractAddress,
      transactionHash: (safeTransactionHash as Hex) || receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      status: receipt.status,
      replacementType: transaction.replacementType,
    },
    summary: transaction.summary || '',
  })
}
