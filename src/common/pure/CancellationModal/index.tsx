import { useMemo } from 'react'

import {
  ConfirmationPendingContent,
  OperationType,
  TransactionErrorContent,
} from 'legacy/components/TransactionConfirmationModal'
import { shortenOrderId } from 'legacy/utils'

import { CancellationModalContext } from 'common/hooks/useCancelOrder/state'
import { GpModal as Modal } from 'common/pure/Modal'

import { RequestCancellationModal } from './RequestCancellationModal'

export type CancellationModalProps = {
  isOpen: boolean
  onDismiss: () => void
  context: CancellationModalContext
}

export function CancellationModal(props: CancellationModalProps): JSX.Element | null {
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
      return <TransactionErrorContent onDismiss={onDismiss} message={error || 'Failed to cancel order'} />
    }

    if (isPendingSignature) {
      return (
        <ConfirmationPendingContent
          chainId={chainId}
          onDismiss={onDismiss}
          pendingText={
            <>
              Cancelling order with id {shortId}:
              <br />
              <em>{summary}</em>
            </>
          }
          operationType={OperationType.ORDER_CANCEL}
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
