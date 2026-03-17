import { ReactNode } from 'react'

import { formatSymbol, getIsNativeToken } from '@cowprotocol/common-utils'
import { OrderStatus as ApiOrderStatus } from '@cowprotocol/cow-sdk'

import { t } from '@lingui/core/macro'

import { useAllTransactions } from 'legacy/state/enhancedTransactions/hooks'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'
import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { isOrderExpired } from 'legacy/state/orders/utils'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { isOrderFilled } from 'utils/orderUtils/isOrderFilled'

import { EthFlowStepper as Pure, EthFlowStepperProps as PureProps, TxState } from '../../pure/EthFlowStepper'
import { SmartOrderStatus } from '../../pure/EthFlowStepper/constants'

interface CreationState {
  state: TxState
  creationTx: EnhancedTransactionDetails | undefined
  creationTxFailed: boolean | undefined
}

type EthFlowStepperProps = {
  order: Order | undefined
  showProgressBar?: boolean
}

export function EthFlowStepper(props: EthFlowStepperProps): ReactNode {
  const { order, showProgressBar } = props
  const native = useNativeCurrency()

  const allTxs = useAllTransactions()

  const cancellationHash = order?.cancellationHash
  const cancellationTx = cancellationHash ? allTxs[cancellationHash] : undefined

  const isEthFlowOrder = !!order?.inputToken && getIsNativeToken(order.inputToken)

  if (!order || !isEthFlowOrder) {
    return null
  }

  const { state: creation, creationTxFailed, creationTx } = getCreationTxState(order, allTxs)
  const state = mapOrderToEthFlowStepperState(order, creationTx, cancellationTx)

  if (!state) return null

  const rejectedReason = creationTxFailed ? t`Transaction failed` : undefined

  const refundHash = order.refundHash || order.apiAdditionalInfo?.ethflowData?.refundTxHash || undefined
  // A backend-confirmed EthFlow cancellation implies the ETH should already be on the
  // refund path, even when no explicit refund tx or flag is present yet.
  const shouldTreatAsRefunded = isCancellationConfirmed(order) || order.isRefunded === true || !!refundHash

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
    creation,
    refund: {
      hash: refundHash,
      failed: shouldTreatAsRefunded ? false : undefined,
    },
    cancellation: {
      hash: cancellationHash,
      failed: didCancellationFail(order, cancellationTx),
    },
  }

  return <Pure {...stepperProps} />
}

const ORDER_INDEXED_STATUSES: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.EXPIRED, OrderStatus.CANCELLED]

function didCancellationFail(order: Order, tx: EnhancedTransactionDetails | undefined): boolean | undefined {
  if (order.status === OrderStatus.FULFILLED || isOrderFilled(order)) {
    return undefined
  }

  if (isCancellationConfirmed(order)) {
    return false
  }

  if (tx?.receipt?.status === 0) {
    return true
  }

  return undefined
}

function didTxFail(tx: EnhancedTransactionDetails | undefined): boolean | undefined {
  if (tx?.receipt?.status === undefined) {
    return undefined
  }
  return tx.receipt.status !== 1
}

function getCreationTxState(order: Order, allTxs: { [txHash: string]: EnhancedTransactionDetails }): CreationState {
  const { orderCreationHash: creationHash } = order
  const creationTx = creationHash ? allTxs[creationHash] : undefined
  const creationLinkedTx = creationTx?.linkedTransactionHash ? allTxs[creationTx.linkedTransactionHash] : undefined
  const creationTxFailed = didTxFail(creationTx)

  return {
    creationTx,
    creationTxFailed,
    state: {
      hash: creationHash,
      failed: creationTxFailed,
      cancelled: creationLinkedTx?.replacementType === 'cancel',
      spedUp: creationLinkedTx?.replacementType === 'speedup',
      replaced: creationLinkedTx?.replacementType === 'replaced',
    },
  }
}

// Uses the backend API status directly instead of classifyOrder(), because the
// buffered classifier intentionally waits before exposing cancelled state.
function isCancellationConfirmed(order: Order): boolean {
  return order.apiAdditionalInfo?.status === ApiOrderStatus.CANCELLED
}

function isEthFlowOrderExpired(order: Order | undefined): boolean {
  return order?.status === 'expired' || isOrderExpired({ validTo: order?.validTo as number })
}

function mapOrderToEthFlowStepperState(
  order: Order | undefined,
  creationTx: EnhancedTransactionDetails | undefined,
  cancellationTx: EnhancedTransactionDetails | undefined,
): SmartOrderStatus | undefined {
  if (!order) return

  const { status } = order

  if (status === 'fulfilled' || isOrderFilled(order)) {
    return SmartOrderStatus.FILLED
  }

  if (ORDER_INDEXED_STATUSES.includes(status) || cancellationTx?.receipt) {
    return SmartOrderStatus.INDEXED
  }

  if (status === 'creating' && creationTx?.receipt) {
    return SmartOrderStatus.CREATION_MINED
  }

  return SmartOrderStatus.CREATING
}
