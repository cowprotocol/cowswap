import type { TransactionReceipt } from 'viem'

import { UiOrderType } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'
import { orderBookApi } from 'cowSdk'

import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'
import { partialOrderUpdate } from 'legacy/state/orders/utils'

import { emitCancelledOrderEvent } from 'modules/orders'

import { emitOnchainTransactionEvent } from '../../../utils/emitOnchainTransactionEvent'
import { CheckEthereumTransactions } from '../types'

export function finalizeOnChainCancellation(
  transaction: EnhancedTransactionDetails,
  receipt: TransactionReceipt,
  params: CheckEthereumTransactions,
  hash: string,
  orderId: string,
  sellTokenSymbol: string,
): void {
  const { chainId, isSafeWallet, dispatch, cancelOrdersBatch, getTwapOrderById } = params

  if (receipt.status === 'success') {
    // If cancellation succeeded, mark order as cancelled
    cancelOrdersBatch({ chainId, ids: [orderId], isSafeWallet })

    const twapOrderResult = getTwapOrderById(orderId)

    if (twapOrderResult) {
      emitCancelledOrderEvent({
        chainId,
        order: twapOrderResult.order,
        orderType: UiOrderType.TWAP,
        transactionHash: hash,
        isEoaTwap: twapOrderResult.isEoaTwap,
        analyticsOrderId: twapOrderResult.analyticsOrderId,
        analyticsWalletAddress: twapOrderResult.analyticsWalletAddress,
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
      dispatch,
    )
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
      summary: t`Failed to cancel order selling ${sellTokenSymbol}`,
      // `receipt.transactionHash` is an on-chain Ethereum tx hash, not a safeTxHash.
      isSafeTx: false,
    })
  }
}
