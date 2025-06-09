import { formatSymbol, getIsNativeToken } from '@cowprotocol/common-utils'

import { useAllTransactions } from 'legacy/state/enhancedTransactions/hooks'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'
import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { isOrderExpired } from 'legacy/state/orders/utils'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { EthFlowStepper as Pure, EthFlowStepperProps as PureProps, SmartOrderStatus } from '../../pure/EthFlowStepper'

type EthFlowStepperProps = {
  order: Order | undefined
  showProgressBar?: boolean
}

// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
export function EthFlowStepper(props: EthFlowStepperProps) {
  const { order, showProgressBar } = props
  const native = useNativeCurrency()

  const allTxs = useAllTransactions()

  const creationHash = order?.orderCreationHash
  const cancellationHash = order?.cancellationHash
  // TODO: add refund hash when available from API

  const creationTx = creationHash ? allTxs[creationHash] : undefined
  const creationLinkedTx = creationTx?.linkedTransactionHash ? allTxs[creationTx.linkedTransactionHash] : undefined
  const cancellationTx = cancellationHash ? allTxs[cancellationHash] : undefined

  const state = mapOrderToEthFlowStepperState(order, creationTx, cancellationTx)

  const isEthFlowOrder = !!order?.inputToken && getIsNativeToken(order.inputToken)

  if (!order || !state || !isEthFlowOrder) {
    return null
  }

  const creationTxFailed = didTxFail(creationTx)

  const rejectedReason = creationTxFailed ? 'Transaction failed' : undefined

  const stepperProps: PureProps = {
    nativeTokenSymbol: native.symbol as string,
    tokenLabel: formatSymbol(order.outputToken.symbol) || '',
    order: {
      orderId: order.id,
      state,
      isExpired: isEthFlowOrderExpired(order),
      isCreated: !!order.apiAdditionalInfo,
      rejectedReason,
    },
    showProgressBar,
    creation: {
      hash: creationHash,
      failed: creationTxFailed,
      cancelled: creationLinkedTx?.replacementType === 'cancel',
      spedUp: creationLinkedTx?.replacementType === 'speedup',
      replaced: creationLinkedTx?.replacementType === 'replaced',
    },
    refund: {
      hash: order.refundHash,
      failed: didRefundFail(order),
    },
    cancellation: {
      hash: cancellationHash,
      failed: didCancellationFail(order, cancellationTx),
    },
  }

  return <Pure {...stepperProps} />
}

const ORDER_INDEXED_STATUSES: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.EXPIRED, OrderStatus.CANCELLED]

function mapOrderToEthFlowStepperState(
  order: Order | undefined,
  creationTx: EnhancedTransactionDetails | undefined,
  cancellationTx: EnhancedTransactionDetails | undefined,
): SmartOrderStatus | undefined {
  if (order) {
    const { status } = order

    if (status === 'fulfilled') {
      return SmartOrderStatus.FILLED
    } else if (ORDER_INDEXED_STATUSES.includes(status) || cancellationTx?.receipt) {
      return SmartOrderStatus.INDEXED
    } else if (status === 'creating' && creationTx?.receipt) {
      return SmartOrderStatus.CREATION_MINED
    }
    return SmartOrderStatus.CREATING
  }
  return undefined
}

function isEthFlowOrderExpired(order: Order | undefined): boolean {
  return order?.status === 'expired' || isOrderExpired({ validTo: order?.validTo as number })
}

function didTxFail(tx: EnhancedTransactionDetails | undefined): boolean | undefined {
  if (tx?.receipt?.status === undefined) {
    return undefined
  }
  return tx.receipt.status !== 1
}

function didCancellationFail(order: Order, tx: EnhancedTransactionDetails | undefined): boolean | undefined {
  if (order.status === OrderStatus.CANCELLED) {
    return false
  }
  return didTxFail(tx)
}

function didRefundFail(order: Order): boolean | undefined {
  if (order.isRefunded === undefined) {
    return undefined
  }
  return !order.refundHash
}
