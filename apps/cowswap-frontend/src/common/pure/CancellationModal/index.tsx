import React, { ReactElement, useMemo } from 'react'

import { shortenOrderId } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { CancellationModalContext } from 'common/hooks/useCancelOrder/state'
import { CowModal as Modal } from 'common/pure/Modal'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

import { RequestCancellationModal } from './RequestCancellationModal'

import { ConfirmationPendingContent } from '../ConfirmationPendingContent'

export type CancellationModalProps = {
  isOpen: boolean
  onDismiss: Command
  context: CancellationModalContext
  orderSummary: string | undefined
}

export function CancellationModal(props: CancellationModalProps): ReactElement | null {
  const { isOpen, onDismiss, context, orderSummary } = props
  const { chainId, orderId, error, defaultType, isPendingSignature, triggerCancellation, txCost, nativeCurrency } =
    context

  const shortId = shortenOrderId(orderId || '')

  const content = useMemo(() => {
    if (!triggerCancellation || !chainId || !orderId) {
      return null
    }

    if (error !== null) {
      return <TransactionErrorContent modalMode onDismiss={onDismiss} message={error || t`Failed to cancel order`} />
    }

    if (isPendingSignature) {
      return (
        <ConfirmationPendingContent
          modalMode
          onDismiss={onDismiss}
          title={
            <Trans>
              Cancelling order with id {shortId}:
              <br />
              <em>{orderSummary}</em>
            </Trans>
          }
          description={t`Canceling your order`}
          operationLabel={t`cancellation`}
        />
      )
    } else {
      return (
        <RequestCancellationModal
          onDismiss={onDismiss}
          triggerCancellation={triggerCancellation}
          summary={orderSummary}
          shortId={shortId}
          defaultType={defaultType}
          txCost={txCost}
          nativeCurrency={nativeCurrency}
        />
      )
    }
  }, [
    triggerCancellation,
    chainId,
    orderId,
    error,
    defaultType,
    onDismiss,
    isPendingSignature,
    orderSummary,
    shortId,
    txCost,
    nativeCurrency,
  ])

  return (
    content && (
      <Modal isOpen={isOpen} onDismiss={onDismiss}>
        {content}
      </Modal>
    )
  )
}
