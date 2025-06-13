import { useAtomValue, useSetAtom } from 'jotai'
import React, { useCallback, useState } from 'react'

import { isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { LegacyConfirmationModalContent } from 'legacy/components/TransactionConfirmationModal/LegacyConfirmationModalContent'
import { useRequestOrderCancellation } from 'legacy/state/orders/hooks'

import { ordersToCancelAtom, updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { useCancelMultipleOrders } from 'common/hooks/useMultipleOrdersCancellation/useCancelMultipleOrders'
import { CowModal as Modal } from 'common/pure/Modal'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

import { ConfirmationPendingContent } from '../../pure/ConfirmationPendingContent'
interface Props {
  isOpen: boolean
  onDismiss: Command
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function MultipleOrdersCancellationModal(props: Props) {
  const { isOpen, onDismiss } = props

  const { chainId } = useWalletInfo()
  const ordersToCancel = useAtomValue(ordersToCancelAtom)
  const updateOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const cancelAll = useCancelMultipleOrders()
  const cancelPendingOrder = useRequestOrderCancellation()
  const [cancellationInProgress, setCancellationInProgress] = useState(false)
  const [cancellationError, setCancellationError] = useState<Error | null>(null)

  const ordersCount = ordersToCancel.length || 0

  const dismissAll = useCallback(() => {
    setCancellationInProgress(false)
    onDismiss()
    setCancellationError(null)
  }, [onDismiss])

  const signAndSendCancellation = useCallback(async () => {
    if (!chainId) return

    // Show pending modal
    setCancellationInProgress(true)

    try {
      // Sign and send cancellation message
      await cancelAll(ordersToCancel)

      // Change orders state in store
      ordersToCancel.forEach((order) => {
        cancelPendingOrder({ chainId, id: order.id })
      })

      // Clean cancellation queue
      updateOrdersToCancel([])
      dismissAll()
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setCancellationInProgress(false)
      setCancellationError(error)
    }
  }, [chainId, cancelPendingOrder, cancelAll, ordersToCancel, dismissAll, updateOrdersToCancel])

  if (!isOpen || !chainId) return null

  // TODO: use TradeConfirmModal
  if (cancellationError) {
    const errorMessage = isRejectRequestProviderError(cancellationError)
      ? 'User rejected signing'
      : cancellationError.message

    return (
      <Modal isOpen={true} onDismiss={dismissAll}>
        <TransactionErrorContent modalMode onDismiss={dismissAll} message={errorMessage} />
      </Modal>
    )
  }

  if (cancellationInProgress) {
    return (
      <Modal isOpen={true} onDismiss={dismissAll}>
        <ConfirmationPendingContent
          modalMode
          onDismiss={onDismiss}
          title={<>Cancelling {ordersCount} orders</>}
          description="Canceling your order"
          operationLabel="cancellation"
        />
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <LegacyConfirmationModalContent
        title={`Cancel multiple orders: ${ordersCount}`}
        onDismiss={onDismiss}
        // TODO: Extract nested component outside render function
        // eslint-disable-next-line react/no-unstable-nested-components
        topContent={() => (
          <div>
            <p>Are you sure you want to cancel {ordersCount} orders?</p>
          </div>
        )}
        // TODO: Extract nested component outside render function
        // eslint-disable-next-line react/no-unstable-nested-components
        bottomContent={() => (
          <div>
            <ButtonPrimary onClick={signAndSendCancellation}>Request cancellations</ButtonPrimary>
          </div>
        )}
      />
    </Modal>
  )
}
