import React, { ReactElement, useMemo } from 'react'

import { shortenOrderId } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'

import { CancellationModalContext } from 'common/hooks/useCancelOrder/state'
import { CowModal as Modal } from 'common/pure/Modal'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

import { RequestCancellationModal } from './RequestCancellationModal'

import { ConfirmationPendingContent } from '../ConfirmationPendingContent'

export type CancellationModalProps = {
  isOpen: boolean
  onDismiss: Command
  context: CancellationModalContext
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function CancellationModal(props: CancellationModalProps): ReactElement | null {
  const { isOpen, onDismiss, context } = props
  const {
    chainId,
    orderId,
    summary,
    error,
    defaultType,
    isPendingSignature,
    triggerCancellation,
    txCost,
    nativeCurrency,
  } = context

  const shortId = shortenOrderId(orderId || '')

  const content = useMemo(() => {
    if (!triggerCancellation || !chainId || !orderId) {
      return null
    }

    if (error !== null) {
      return <TransactionErrorContent modalMode onDismiss={onDismiss} message={error || 'Failed to cancel order'} />
    }

    if (isPendingSignature) {
      return (
        <ConfirmationPendingContent
          modalMode
          onDismiss={onDismiss}
          title={
            <>
              Cancelling order with id {shortId}:
              <br />
              <em>{summary}</em>
            </>
          }
          description="Canceling your order"
          operationLabel="cancellation"
        />
      )
    } else {
      return (
        <RequestCancellationModal
          onDismiss={onDismiss}
          triggerCancellation={triggerCancellation}
          summary={summary ?? ''}
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
    summary,
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
