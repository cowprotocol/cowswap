import { shortenOrderId } from 'utils'
import { GpModal as Modal } from 'components/Modal'
import {
  ConfirmationPendingContent,
  OperationType,
  TransactionErrorContent,
} from 'components/TransactionConfirmationModal'
import { RequestCancellationModal } from './RequestCancellationModal'
import { useMemo } from 'react'
import { CancelButtonProps } from '@cow/common/pure/CancelButton/index'

export type CancellationModalProps = Pick<
  CancelButtonProps,
  'chainId' | 'orderId' | 'onDismiss' | 'summary' | 'softCancellationContext' | 'error' | 'type'
> & {
  onDismiss: () => void
}

export function CancellationModal(props: CancellationModalProps): JSX.Element | null {
  const { chainId, orderId, onDismiss, summary, softCancellationContext, error, type } = props

  const shortId = shortenOrderId(orderId)

  const content = useMemo(() => {
    if (error !== null) {
      return <TransactionErrorContent onDismiss={onDismiss} message={error || 'Failed to cancel order'} />
    }
    if (type === 'soft' && softCancellationContext) {
      const { cancelOrder, isWaitingSignature } = softCancellationContext

      if (isWaitingSignature) {
        return (
          <ConfirmationPendingContent
            chainId={chainId}
            onDismiss={onDismiss}
            pendingText={
              <>
                Soft cancelling order with id {shortId}:
                <br />
                <em>{summary}</em>
              </>
            }
            operationType={OperationType.ORDER_CANCEL}
          />
        )
      } else {
        return (
          <RequestCancellationModal onDismiss={onDismiss} onClick={cancelOrder} summary={summary} shortId={shortId} />
        )
      }
    }
    return null
  }, [chainId, error, onDismiss, shortId, softCancellationContext, summary, type])

  return (
    content && (
      <Modal isOpen onDismiss={onDismiss}>
        {content}
      </Modal>
    )
  )
}
