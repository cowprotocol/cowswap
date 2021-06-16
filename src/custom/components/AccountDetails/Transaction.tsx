import React, { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, XCircle, Triangle } from 'react-feather'

import { useActiveWeb3React } from 'hooks'
import { getEtherscanLink, shortenOrderId } from 'utils'
import { RowFixed } from 'components/Row'
import Loader from 'components/Loader'
import {
  TransactionWrapper,
  TransactionState as OldTransactionState,
  TransactionStatusText,
  IconWrapper
} from './TransactionMod'
import Pill from '../Pill'
import styled from 'styled-components'
import {
  ConfirmationModalContent,
  ConfirmationPendingContent,
  TransactionErrorContent
} from 'components/TransactionConfirmationModal'

import { ActivityStatus, ActivityType, useActivityDescriptors } from 'hooks/useRecentActivity'
import { useCancelOrder } from 'hooks/useCancelOrder'
import { LinkStyledButton } from 'theme'
import Modal from 'components/Modal'
import { ButtonPrimary } from 'components/Button'
import { MouseoverTooltip } from 'components/Tooltip'

const PILL_COLOUR_MAP = {
  CONFIRMED: '#1b7b43',
  PENDING_ORDER: '#8958FF',
  PENDING_TX: '#2b68fa',
  EXPIRED_ORDER: '#b94d54',
  CANCELLED_ORDER: '#808080',
  CANCELLING_ORDER: '#8998FF'
}

function determinePillColour(status: ActivityStatus, type: ActivityType) {
  const isOrder = type === ActivityType.ORDER
  switch (status) {
    case ActivityStatus.PENDING:
      return isOrder ? PILL_COLOUR_MAP.PENDING_ORDER : PILL_COLOUR_MAP.PENDING_TX
    case ActivityStatus.CONFIRMED:
      return PILL_COLOUR_MAP.CONFIRMED
    case ActivityStatus.EXPIRED:
      return PILL_COLOUR_MAP.EXPIRED_ORDER
    case ActivityStatus.CANCELLING:
      return PILL_COLOUR_MAP.CANCELLING_ORDER
    case ActivityStatus.CANCELLED:
      return PILL_COLOUR_MAP.CANCELLED_ORDER
  }
}

function getActivitySummary({
  id,
  activityData,
  suffix
}: {
  id: string
  activityData: ReturnType<typeof useActivityDescriptors>
  suffix?: string
}) {
  if (!activityData) return null

  const { summary } = activityData

  let baseSummary = summary

  if (suffix && baseSummary) {
    // Shorten summary when `suffix` is set and it matches the regex.
    // It should always match the regex
    const m = baseSummary.match(/(Swap\s+[\d.]+)/)
    baseSummary = (m && m.length > 1 ? m[1] + ' … ' : baseSummary + ' ') + suffix
  }

  baseSummary = baseSummary ?? id

  return baseSummary + ' ↗'
}

const RowWrapper = styled(TransactionWrapper)`
  display: flex;

  & > a {
    width: 100%;
  }
`

// override the href, pending and success props
// override mouse actions via CSS when we dont want a clickable row
const TransactionState = styled(OldTransactionState).attrs(
  (props): { href?: string; disableMouseActions?: boolean; pending?: boolean; success?: boolean } => props
)`
  ${(props): string | false => !!props.disableMouseActions && `pointer-events: none; cursor: none;`}
`

export const CancellationSummary = styled.span`
  padding: 12px;
  margin: 0;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg4};
`

type RequestCancellationModalProps = {
  onDismiss: () => void
  onClick: () => void
  summary?: string
  shortId: string
}

function RequestCancellationModal(props: RequestCancellationModalProps): JSX.Element {
  const { onDismiss, onClick, summary, shortId } = props

  const [showMore, setShowMore] = useState(false)

  const toggleShowMore = () => setShowMore(showMore => !showMore)

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

type CancellationModalProps = {
  onDismiss: () => void
  isOpen: boolean
  orderId: string
  summary: string | undefined
}

function CancellationModal(props: CancellationModalProps): JSX.Element | null {
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
      .catch(e => {
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

export default function Transaction({ hash: id }: { hash: string }) {
  const { chainId } = useActiveWeb3React()
  // Return info necessary for rendering order/transaction info from the incoming id
  // returns info related to activity: TransactionDetails | Order
  const activityData = useActivityDescriptors({ id, chainId })

  const [showCancelModal, setShowCancelModal] = useState(false)

  if (!activityData || !chainId) return null

  const { activity, status, type } = activityData

  const isPending = status === ActivityStatus.PENDING
  const isConfirmed = status === ActivityStatus.CONFIRMED
  const isExpired = status === ActivityStatus.EXPIRED
  const isCancelling = status === ActivityStatus.CANCELLING
  const isCancelled = status === ActivityStatus.CANCELLED
  const isCancellable = isPending && type === ActivityType.ORDER

  const onCancelClick = () => setShowCancelModal(true)
  const onDismiss = () => setShowCancelModal(false)

  return (
    <RowWrapper>
      <TransactionState href={getEtherscanLink(chainId, id, 'transaction')}>
        <RowFixed>
          {activity && (
            <Pill color="#fff" bgColor={determinePillColour(status, type)} minWidth="3.5rem">
              {type}
            </Pill>
          )}
          <TransactionStatusText>
            {isCancelling ? (
              <MouseoverTooltip text={activity.summary || id}>
                {getActivitySummary({ activityData, id, suffix: '(Cancellation requested)' })}
              </MouseoverTooltip>
            ) : (
              getActivitySummary({ activityData, id })
            )}
          </TransactionStatusText>
        </RowFixed>
        <IconWrapper pending={isPending || isCancelling} success={isConfirmed || isCancelled}>
          {isPending || isCancelling ? (
            <Loader />
          ) : isConfirmed ? (
            <CheckCircle size="16" />
          ) : isExpired ? (
            <AlertCircle size="16" />
          ) : isCancelled ? (
            <XCircle size="16" />
          ) : (
            <Triangle size="16" />
          )}
        </IconWrapper>
      </TransactionState>
      {isCancellable && (
        <>
          <LinkStyledButton onClick={onCancelClick}>(cancel)</LinkStyledButton>
          {showCancelModal && (
            <CancellationModal
              orderId={id}
              summary={activityData.summary}
              isOpen={showCancelModal}
              onDismiss={onDismiss}
            />
          )}
        </>
      )}
    </RowWrapper>
  )
}
