import { useAtomValue, useSetAtom } from 'jotai'
import React, { ReactNode, useCallback, useState } from 'react'

import { getProviderErrorMessage, isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { LegacyConfirmationModalContent } from 'legacy/components/TransactionConfirmationModal/LegacyConfirmationModalContent'
import { useRequestOrderCancellation } from 'legacy/state/orders/hooks'

import { getIsOrderBookTypedError } from 'api/cowProtocol'
import {
  ordersToCancelAtom,
  updateOrdersToCancelAtom,
} from 'common/hooks/useMultipleOrdersCancellation/ordersToCancel.atom'
import { useCancelMultipleOrders } from 'common/hooks/useMultipleOrdersCancellation/useCancelMultipleOrders'
import { CowModal as Modal } from 'common/pure/Modal'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

import { ConfirmationPendingContent } from '../../pure/ConfirmationPendingContent'
interface Props {
  isOpen: boolean
  onDismiss: Command
}

export function MultipleOrdersCancellationModal(props: Props): ReactNode {
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
    } catch (error) {
      setCancellationInProgress(false)
      setCancellationError(error)
    }
  }, [chainId, cancelPendingOrder, cancelAll, ordersToCancel, dismissAll, updateOrdersToCancel])

  if (!isOpen || !chainId) return null

  if (cancellationError) {
    const errorMessage = isRejectRequestProviderError(cancellationError)
      ? t`User rejected signing the cancellation`
      : getIsOrderBookTypedError(cancellationError)
        ? cancellationError.body.description || cancellationError.body.errorType
        : (getProviderErrorMessage(cancellationError) ?? String(cancellationError))

    return (
      <Modal isOpen onDismiss={dismissAll}>
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
          title={t`Cancelling ${ordersCount} orders`}
          description={t`Canceling your order`}
          operationLabel={t`cancellation`}
        />
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <LegacyConfirmationModalContent
        title={t`Cancel multiple orders: ${ordersCount}`}
        onDismiss={onDismiss}
        topContent={
          <div>
            <p>
              <Trans>Are you sure you want to cancel {ordersCount} orders?</Trans>
            </p>
          </div>
        }
        bottomContent={
          <div>
            <ButtonPrimary onClick={signAndSendCancellation}>
              <Trans>Request cancellations</Trans>
            </ButtonPrimary>
          </div>
        }
      />
    </Modal>
  )
}
