import { ReactNode } from 'react'

import { formatSymbol, getIsNativeToken } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'

import { useAllTransactions } from 'legacy/state/enhancedTransactions/hooks'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'
import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { isOrderExpired } from 'legacy/state/orders/utils'

import { SmartOrderStatus } from 'modules/ethFlow/pure/EthFlowStepper/constants'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { EthFlowStepper as Pure, EthFlowStepperProps as PureProps, TxState } from '../../pure/EthFlowStepper'

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
      failed: !refundHash,
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
  if (!order) return

  const { status } = order

  if (status === 'fulfilled') {
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
