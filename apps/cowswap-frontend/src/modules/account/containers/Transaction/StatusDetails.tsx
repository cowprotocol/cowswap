import { ExternalLink as LinkIconFeather } from 'react-feather'
import SVG from 'react-inlinesvg'

import OrderCancelledImage from 'legacy/assets/cow-swap/order-cancelled.svg'
import OrderCheckImage from 'legacy/assets/cow-swap/order-check.svg'
import OrderExpiredImage from 'legacy/assets/cow-swap/order-expired.svg'
import OrderOpenImage from 'legacy/assets/cow-swap/order-open.svg'
import PresignaturePendingImage from 'legacy/assets/cow-swap/order-presignature-pending.svg'
import { getActivityState } from 'legacy/hooks/useActivityDerivedState'
import { ExplorerDataType, getExplorerLink } from 'legacy/utils/getExplorerLink'

import { getSafeWebUrl } from 'api/gnosisSafe'
import { CancelButton } from 'common/pure/CancelButton'
import { isOrderCancellable } from 'common/utils/isOrderCancellable'

import { CancelTxLink, StatusLabel, StatusLabelBelow, StatusLabelWrapper } from './styled'

import { ActivityDerivedState, determinePillColour } from './index'

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
  chainId: number
  activityDerivedState: ActivityDerivedState
  showCancellationModal: (() => void) | null
}

export function StatusDetails(props: StatusDetailsProps) {
  const { chainId, activityDerivedState, showCancellationModal } = props

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
    order,
    enhancedTransaction,
  } = activityDerivedState

  const cancellationHash = activityDerivedState.order?.cancellationHash
  const isCancellable = order ? isOrderCancellable(order) : true

  const safeAddress =
    enhancedTransaction?.safeTransaction?.safe ||
    order?.presignGnosisSafeTx?.safe ||
    activityDerivedState.gnosisSafeInfo?.address

  const hasCancellationHash = !!cancellationHash && !isCancelling && !isConfirmed && isCancelled
  const cancellationTxLink = hasCancellationHash
    ? safeAddress
      ? getSafeWebUrl(chainId, safeAddress, cancellationHash)
      : getExplorerLink(chainId, cancellationHash, ExplorerDataType.TRANSACTION)
    : null

  return (
    <StatusLabelWrapper withCancellationHash$={!!cancellationHash}>
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

      {showCancellationModal && isCancellable && (
        <StatusLabelBelow>
          <CancelButton onClick={showCancellationModal} />
        </StatusLabelBelow>
      )}
      {hasCancellationHash && cancellationTxLink && (
        <CancelTxLink href={cancellationTxLink} target="_blank" title="Cancellation transaction">
          <LinkIconFeather size={16} />
        </CancelTxLink>
      )}
    </StatusLabelWrapper>
  )
}
