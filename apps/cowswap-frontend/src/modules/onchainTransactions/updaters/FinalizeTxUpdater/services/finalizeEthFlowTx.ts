import { TransactionReceipt } from '@ethersproject/abstract-provider'

import ms from 'ms.macro'

import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'
import { invalidateOrdersBatch } from 'legacy/state/orders/actions'

import { finalizeOnChainCancellation } from './finalizeOnChainCancellation'

import { emitOnchainTransactionEvent } from '../../../utils/emitOnchainTransactionEvent'
import { CheckEthereumTransactions } from '../types'

const DELAY_REMOVAL_ETH_FLOW_ORDER_ID_MILLISECONDS = ms`2m` // Delay removing the order ID since the creation time its mined (minor precaution just to avoid edge cases of delay in indexing times affect the collision detection

export function finalizeEthFlowTx(
  transaction: EnhancedTransactionDetails,
  receipt: TransactionReceipt,
  params: CheckEthereumTransactions,
  hash: string
): void {
  const ethFlowInfo = transaction.ethFlow!
  const { orderId, subType } = ethFlowInfo
  const { chainId, isSafeWallet, dispatch, nativeCurrencySymbol } = params

  // Remove inflight order ids, after a delay to avoid creating the same again in quick succession
  setTimeout(() => params.removeInFlightOrderId(orderId), DELAY_REMOVAL_ETH_FLOW_ORDER_ID_MILLISECONDS)

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
