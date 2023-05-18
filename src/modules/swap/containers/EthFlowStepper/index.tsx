import {
  EthFlowStepper as Pure,
  EthFlowStepperProps as PureProps,
  SmartOrderStatus,
} from 'modules/swap/pure/EthFlow/EthFlowStepper'
import { useDetectNativeToken } from 'modules/swap/hooks/useDetectNativeToken'
import { Order, OrderStatus } from 'state/orders/actions'
import { NATIVE_CURRENCY_BUY_ADDRESS } from 'constants/index'
import { isOrderExpired } from 'state/orders/utils'
import { useAllTransactions } from 'state/enhancedTransactions/hooks'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'
import { formatSymbol } from 'utils/format'

type EthFlowStepperProps = {
  order: Order | undefined
}

export function EthFlowStepper(props: EthFlowStepperProps) {
  const { order } = props
  const { native } = useDetectNativeToken()

  const allTxs = useAllTransactions()

  const creationHash = order?.orderCreationHash
  const cancellationHash = order?.cancellationHash
  // TODO: add refund hash when available from API

  const creationTx = creationHash ? allTxs[creationHash] : undefined
  const cancellationTx = cancellationHash ? allTxs[cancellationHash] : undefined

  const state = mapOrderToEthFlowStepperState(order, creationTx, cancellationTx)

  const isEthFlowOrder = getIsEthFlowOrder(order)

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
    creation: {
      hash: creationHash,
      failed: creationTxFailed,
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
  cancellationTx: EnhancedTransactionDetails | undefined
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

// TODO: move this somewhere else?
export function getIsEthFlowOrder(order: Order | undefined): boolean {
  return order?.inputToken.address === NATIVE_CURRENCY_BUY_ADDRESS
}
