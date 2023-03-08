import SVG from 'react-inlinesvg'
import { ExternalLink } from 'theme'

import OrderCheckImage from 'assets/cow-swap/order-check.svg'
import OrderExpiredImage from 'assets/cow-swap/order-expired.svg'
import OrderCancelledImage from 'assets/cow-swap/order-cancelled.svg'

import PresignaturePendingImage from 'assets/cow-swap/order-presignature-pending.svg'
import OrderOpenImage from 'assets/cow-swap/order-open.svg'

import { StatusLabel, StatusLabelWrapper, StatusLabelBelow } from './styled'
import { ActivityDerivedState, determinePillColour } from './index'
import { getSafeWebUrl } from '@cow/api/gnosisSafe'
import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import { getActivityState } from 'hooks/useActivityDerivedState'
import { CancelButton } from '@cow/common/pure/CancelButton'

export function GnosisSafeLink(props: {
  chainId: number
  safeTransaction?: SafeMultisigTransactionResponse
  gnosisSafeThreshold: number
}): JSX.Element | null {
  const { chainId, safeTransaction } = props

  if (!safeTransaction) {
    return null
  }

  const { safe, safeTxHash } = safeTransaction
  const safeUrl = getSafeWebUrl(chainId, safe, safeTxHash)

  // Only show the link to the safe, if we have the "safeUrl"
  if (safeUrl === null) {
    return null
  }

  return <ExternalLink href={safeUrl}>View Gnosis Safe ↗</ExternalLink>
}

function _getStateLabel(activityDerivedState: ActivityDerivedState) {
  const activityState = getActivityState(activityDerivedState)

  switch (activityState) {
    case 'pending':
      return 'Pending...'
    case 'open':
      return 'Open'
    case 'signing':
      return 'Signing...'
    case 'filled':
      return 'Filled'
    case 'executed':
      return 'Executed'
    case 'expired':
      return 'Expired'
    case 'failed':
      return 'Failed'
    case 'cancelling':
      return 'Cancelling...'
    case 'cancelled':
      return 'Cancelled'
    case 'creating':
      return 'Creating...'
    default:
      return 'Open'
  }
}

export type StatusDetailsProps = {
  activityDerivedState: ActivityDerivedState
  showCancellationModal: (() => void) | null
}

export function StatusDetails(props: StatusDetailsProps) {
  const { activityDerivedState, showCancellationModal } = props

  const {
    status,
    type,
    isPending,
    isCancelling,
    isPresignaturePending,
    isConfirmed,
    isExpired,
    isFailed,
    isTransaction,
    isCancelled,
    isCreating,
  } = activityDerivedState

  return (
    <StatusLabelWrapper>
      <StatusLabel
        color={determinePillColour(status, type)}
        isTransaction={isTransaction}
        isPending={isPending}
        isCancelling={isCancelling}
        isPresignaturePending={isPresignaturePending}
        isCreating={isCreating}
      >
        {isConfirmed && isTransaction ? (
          <SVG src={OrderCheckImage} description="Transaction Confirmed" />
        ) : isConfirmed ? (
          <SVG src={OrderCheckImage} description="Order Filled" />
        ) : isExpired && isTransaction ? (
          <SVG src={OrderCancelledImage} description="Transaction Failed" />
        ) : isFailed ? (
          <SVG src={OrderCancelledImage} description="Failed" />
        ) : isExpired ? (
          <SVG src={OrderExpiredImage} description="Order Expired" />
        ) : isCreating ? (
          // TODO: use another icon for Creating state
          <SVG src={OrderExpiredImage} description="Creating Order" />
        ) : isCancelled ? (
          <SVG src={OrderCancelledImage} description="Order Cancelled" />
        ) : isPresignaturePending ? (
          <SVG src={PresignaturePendingImage} description="Pending pre-signature" />
        ) : isCancelling ? null : (
          <SVG src={OrderOpenImage} description="Order Open" />
        )}
        {_getStateLabel(activityDerivedState)}
      </StatusLabel>

      {showCancellationModal && (
        <StatusLabelBelow>
          <CancelButton onClick={showCancellationModal} />
        </StatusLabelBelow>
      )}
    </StatusLabelWrapper>
  )
}
