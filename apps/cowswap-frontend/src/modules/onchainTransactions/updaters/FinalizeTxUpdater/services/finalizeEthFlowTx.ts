import type { TransactionReceipt } from 'viem'

import { t } from '@lingui/core/macro'

import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'
import { invalidateOrdersBatch } from 'legacy/state/orders/actions'

import { finalizeOnChainCancellation } from './finalizeOnChainCancellation'

import { emitOnchainTransactionEvent } from '../../../utils/emitOnchainTransactionEvent'
import { CheckEthereumTransactions } from '../types'

export function finalizeEthFlowTx(
  transaction: EnhancedTransactionDetails,
  receipt: TransactionReceipt,
  params: CheckEthereumTransactions,
  hash: string,
): void {
  const ethFlowInfo = transaction.ethFlow!
  const { orderId, subType } = ethFlowInfo
  const { chainId, isSafeWallet, dispatch, nativeCurrencySymbol } = params

  if (subType === 'creation') {
    if (receipt.status !== 'success') {
      // If creation failed:
      // 1. Mark order as invalid
      dispatch(invalidateOrdersBatch({ chainId, ids: [orderId], isSafeWallet }))
      // 2. Show failure tx pop-up

      emitOnchainTransactionEvent({
        receipt: {
          to: receipt.to || '',
          from: receipt.from,
          contractAddress: receipt.contractAddress || '',
          transactionHash: receipt.transactionHash,
          blockNumber: Number(receipt.blockNumber),
          status: 0, // inside receipt.status !== 'success' block
          replacementType: transaction.replacementType,
        },
        summary: t`Failed to place order selling ${nativeCurrencySymbol}`,
      })
    }
  }

  if (subType === 'cancellation') {
    finalizeOnChainCancellation(transaction, receipt, params, hash, orderId, nativeCurrencySymbol)
  }
}
