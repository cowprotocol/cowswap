import React, { useCallback, useEffect, useState } from 'react'

import { LinkStyledButton } from 'theme'

import { useCancelOrder } from 'hooks/useCancelOrder'
import { ButtonPrimary } from 'components/Button'
import { GpModal as Modal } from 'components/Modal'
import {
  ConfirmationModalContent,
  ConfirmationPendingContent,
  TransactionErrorContent,
} from 'components/TransactionConfirmationModal'
import { CancellationSummary } from './styled'

import { shortenOrderId } from 'utils'

type RequestCancellationModalProps = {
  onDismiss: () => void
  onClick: () => void
  summary?: string
  shortId: string
}

function RequestCancellationModal(props: RequestCancellationModalProps): JSX.Element {
  const { onDismiss, onClick, summary, shortId } = props

  const [showMore, setShowMore] = useState(false)

  const toggleShowMore = () => setShowMore((showMore) => !showMore)

  return (
    <ConfirmationModalContent
      title={`Cancel order ${shortId}`}
      onDismiss={onDismiss}
      topContent={() => (
        <>
          <p>
            Are you sure you want to cancel order <strong>{shortId}</strong>?
          </p>
          <CancellationSummary>{summary}</CancellationSummary>
          <p>
            Keep in mind this is a soft cancellation{' '}
            <LinkStyledButton onClick={toggleShowMore}>[{showMore ? '- less' : '+ more'}]</LinkStyledButton>
          </p>
          {showMore && (
            <>
              <p>
                This means that a solver might already have included the order in a solution even if this cancellation
                is successful. Read more in the{' '}
                <a target="_blank" href="/#/faq#can-i-cancel-an-order">
                  FAQ
                </a>
                .
              </p>
            </>
          )}
        </>
      )}
      bottomContent={() => <ButtonPrimary onClick={onClick}>Request cancellation</ButtonPrimary>}
    />
  )
}

export type CancellationModalProps = {
  onDismiss: () => void
  isOpen: boolean
  orderId: string
  summary: string | undefined
}

export function CancellationModal(props: CancellationModalProps): JSX.Element | null {
  const { orderId, isOpen, onDismiss, summary } = props
  const shortId = shortenOrderId(orderId)

  const [isWaitingSignature, setIsWaitingSignature] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancelOrder = useCancelOrder()

  useEffect(() => {
    // Reset status every time orderId changes to avoid race conditions
    setIsWaitingSignature(false)
    setError(null)
  }, [orderId])

  const onClick = useCallback(() => {
    setIsWaitingSignature(true)
    setError(null)

    cancelOrder(orderId)
      .then(onDismiss)
      .catch((e) => {
        setError(e.message)
      })
  }, [cancelOrder, onDismiss, orderId])

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      {error !== null ? (
        <TransactionErrorContent onDismiss={onDismiss} message={error || 'Failed to cancel order'} />
      ) : isWaitingSignature ? (
        <ConfirmationPendingContent
          onDismiss={onDismiss}
          pendingText={`Soft cancelling order with id ${shortId}\n\n${summary}`}
        />
      ) : (
        <RequestCancellationModal onDismiss={onDismiss} onClick={onClick} summary={summary} shortId={shortId} />
      )}
    </Modal>
  )
}
