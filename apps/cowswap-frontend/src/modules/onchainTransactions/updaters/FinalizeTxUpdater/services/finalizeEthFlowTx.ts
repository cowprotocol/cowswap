import { TransactionReceipt } from '@ethersproject/abstract-provider'

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
    if (receipt.status !== 1) {
      // If creation failed:
      // 1. Mark order as invalid
      dispatch(invalidateOrdersBatch({ chainId, ids: [orderId], isSafeWallet }))
      // 2. Show failure tx pop-up

      emitOnchainTransactionEvent({
        receipt: {
          to: receipt.to,
          from: receipt.from,
          contractAddress: receipt.contractAddress,
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          status: receipt.status,
          replacementType: transaction.replacementType,
        },
        summary: `Failed to place order selling ${nativeCurrencySymbol}`,
      })
    }
  }

  if (subType === 'cancellation') {
    finalizeOnChainCancellation(transaction, receipt, params, hash, orderId, nativeCurrencySymbol)
  }
}
