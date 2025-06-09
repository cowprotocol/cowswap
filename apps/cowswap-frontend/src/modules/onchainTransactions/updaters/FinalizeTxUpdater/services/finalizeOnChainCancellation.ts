import { TransactionReceipt } from '@ethersproject/abstract-provider'

import { orderBookApi } from 'cowSdk'

import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'
import { partialOrderUpdate } from 'legacy/state/orders/utils'

import { emitCancelledOrderEvent } from 'modules/orders'

import { emitOnchainTransactionEvent } from '../../../utils/emitOnchainTransactionEvent'
import { CheckEthereumTransactions } from '../types'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function finalizeOnChainCancellation(
  transaction: EnhancedTransactionDetails,
  receipt: TransactionReceipt,
  params: CheckEthereumTransactions,
  hash: string,
  orderId: string,
  sellTokenSymbol: string
) {
  const { chainId, isSafeWallet, dispatch, cancelOrdersBatch, getTwapOrderById } = params

  if (receipt.status === 1) {
    // If cancellation succeeded, mark order as cancelled
    cancelOrdersBatch({ chainId, ids: [orderId], isSafeWallet })

    const twapOrder = getTwapOrderById(orderId)

    if (twapOrder) {
      emitCancelledOrderEvent({
        chainId,
        order: twapOrder,
        transactionHash: hash,
      })

      return
    }

    // Since TWAP parts are living only on PROD env, we should check both envs
    orderBookApi.getOrderMultiEnv(orderId, { chainId }).then((order) => {
      if (!order) return

      emitCancelledOrderEvent({
        chainId,
        order,
        transactionHash: hash,
      })
    })
  } else {
    // If cancellation failed:
    // 1. Update order state and remove the isCancelling flag and cancellationHash
    partialOrderUpdate(
      { chainId, order: { id: orderId, isCancelling: false, cancellationHash: undefined }, isSafeWallet },
      dispatch
    )
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
      summary: `Failed to cancel order selling ${sellTokenSymbol}`,
    })
  }
}
