import React, { useState } from 'react'
import { PenTool as PresignaturePendingImage } from 'react-feather'
import SVG from 'react-inlinesvg'
import { LinkStyledButton, ExternalLink } from 'theme'

import OrderCheckImage from 'assets/cow-swap/order-check.svg'
import OrderExpiredImage from 'assets/cow-swap/order-expired.svg'
import OrderCancelledImage from 'assets/cow-swap/order-cancelled.svg'

// import PresignaturePendingImage from 'assets/cow-swap/order-presignature-pending.svg'
import OrderOpenImage from 'assets/cow-swap/order-open.svg'

import { StatusLabel, StatusLabelWrapper, StatusLabelBelow } from './styled'
import { ActivityDerivedState, determinePillColour } from './index'
import { CancellationModal } from './CancelationModal'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'
import { getSafeWebUrl } from 'api/gnosisSafe'

function GnosisSafeLink(props: {
  chainId: number
  enhancedTransaction: EnhancedTransactionDetails | null
  gnosisSafeThreshold: number
}): JSX.Element | null {
  const { chainId, enhancedTransaction } = props

  if (!enhancedTransaction || !enhancedTransaction.safeTransaction) {
    return null
  }

  const { safe, transactionHash } = enhancedTransaction.safeTransaction
  const safeUrl = getSafeWebUrl(chainId, safe)

  // Only show the link to the safe, if we have the "safeUrl" and the Ethereum transaction is not available
  // The reason we don't show it when the tx is not available, is because the main link will point to the Gnosis Safe already
  if (safeUrl === null || !transactionHash) {
    return null
  }

  return <ExternalLink href={safeUrl}>View Gnosis Safe</ExternalLink>
}

export function StatusDetails(props: { chainId: number; activityDerivedState: ActivityDerivedState }) {
  const { chainId, activityDerivedState } = props

  const {
    id,
    status,
    type,
    summary,
    enhancedTransaction,
    isPending,
    isCancelling,
    isPresignaturePending,
    isConfirmed,
    isExpired,
    isTransaction,
    isCancelled,
    isCancellable,
    gnosisSafeInfo,
  } = activityDerivedState

  const [showCancelModal, setShowCancelModal] = useState(false)

  const onCancelClick = () => setShowCancelModal(true)
  const onDismiss = () => setShowCancelModal(false)

  return (
    <StatusLabelWrapper>
      <StatusLabel
        color={determinePillColour(status, type)}
        isPending={isPending}
        isCancelling={isCancelling}
        isPresignaturePending={isPresignaturePending}
      >
        {isConfirmed && isTransaction ? (
          <SVG src={OrderCheckImage} description="Transaction Confirmed" />
        ) : isConfirmed ? (
          <SVG src={OrderCheckImage} description="Order Filled" />
        ) : isExpired && isTransaction ? (
          <SVG src={OrderCancelledImage} description="Transaction Failed" />
        ) : isExpired ? (
          <SVG src={OrderExpiredImage} description="Order Expired" />
        ) : isCancelled ? (
          <SVG src={OrderCancelledImage} description="Order Cancelled" />
        ) : isPresignaturePending ? (
          // TODO: Michel, is this image alright?
          // <SVG src={PresignaturePendingImage} description="Pending pre-signature" />
          <PresignaturePendingImage size={16} />
        ) : isCancelling ? null : (
          <SVG src={OrderOpenImage} description="Order Open" />
        )}
        {isPending
          ? 'Open'
          : isConfirmed && isTransaction
          ? 'Approved'
          : isConfirmed
          ? 'Filled'
          : isExpired && isTransaction
          ? 'Failed'
          : isExpired
          ? 'Expired'
          : isCancelling
          ? 'Cancelling...'
          : isPresignaturePending
          ? 'Pre-signing...'
          : isCancelled
          ? 'Cancelled'
          : 'Open'}
      </StatusLabel>

      {/* Gnosis Safe Web Link (only shown when the transaction has been mined) */}
      {gnosisSafeInfo && enhancedTransaction && enhancedTransaction.safeTransaction && (
        <StatusLabelBelow>
          {/* View in: Gnosis Safe */}
          <GnosisSafeLink
            chainId={chainId}
            enhancedTransaction={enhancedTransaction}
            gnosisSafeThreshold={gnosisSafeInfo.threshold}
          />
        </StatusLabelBelow>
      )}

      {isCancellable && (
        <StatusLabelBelow>
          {/* Cancel order */}
          <LinkStyledButton onClick={onCancelClick}>Cancel order</LinkStyledButton>
          {showCancelModal && (
            <CancellationModal orderId={id} summary={summary} isOpen={showCancelModal} onDismiss={onDismiss} />
          )}
        </StatusLabelBelow>
      )}
    </StatusLabelWrapper>
  )
}
