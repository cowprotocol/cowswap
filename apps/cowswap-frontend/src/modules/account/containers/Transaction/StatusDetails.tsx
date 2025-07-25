import { ReactNode } from 'react'

import OrderCancelledImage from '@cowprotocol/assets/cow-swap/order-cancelled.svg'
import OrderCheckImage from '@cowprotocol/assets/cow-swap/order-check.svg'
import OrderExpiredImage from '@cowprotocol/assets/cow-swap/order-expired.svg'
import OrderOpenImage from '@cowprotocol/assets/cow-swap/order-open.svg'
import PresignaturePendingImage from '@cowprotocol/assets/cow-swap/order-presignature-pending.svg'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { getSafeWebUrl } from '@cowprotocol/core'
import { Command } from '@cowprotocol/types'

import { Info, ExternalLink as LinkIconFeather } from 'react-feather'
import SVG from 'react-inlinesvg'

import { getActivityState, ActivityState } from 'legacy/hooks/useActivityDerivedState'

import { CancelButton } from 'common/pure/CancelButton'
import { ActivityDerivedState } from 'common/types/activity'
import { isOrderCancellable } from 'common/utils/isOrderCancellable'

import { CancelTxLink, ProgressLink, StatusLabel, StatusLabelBelow, StatusLabelWrapper } from './styled'

import { determinePillColour } from './index'

const activityStatusText: Record<ActivityState, string> = {
  [ActivityState.LOADING]: 'Loading...',
  [ActivityState.PENDING]: 'Pending...',
  [ActivityState.OPEN]: 'Open',
  [ActivityState.SIGNING]: 'Signing...',
  [ActivityState.FILLED]: 'Filled',
  [ActivityState.EXECUTED]: 'Executed',
  [ActivityState.EXPIRED]: 'Expired',
  [ActivityState.FAILED]: 'Failed',
  [ActivityState.CANCELLING]: 'Cancelling...',
  [ActivityState.CANCELLED]: 'Cancelled',
  [ActivityState.CREATING]: 'Creating...',
}

function _getStateLabel(activityDerivedState: ActivityDerivedState): string {
  // Check isLoading flag first to ensure loading state takes precedence
  if (activityDerivedState.isLoading) {
    return activityStatusText[ActivityState.LOADING]
  }
  const activityState = getActivityState(activityDerivedState)
  return activityStatusText[activityState] || 'Open'
}

function _getStatusIcon(activityDerivedState: ActivityDerivedState): ReactNode {
  const {
    isReplaced,
    isConfirmed,
    isTransaction,
    isExpired,
    isFailed,
    isCreating,
    isCancelled,
    isPresignaturePending,
    isCancelling,
    isLoading,
  } = activityDerivedState

  // Don't show any icon when loading
  if (isLoading) {
    return null
  }
  if (isReplaced) {
    return <Info size={16} />
  }
  if (isConfirmed && isTransaction) {
    return <SVG src={OrderCheckImage} description="Transaction Confirmed" />
  }
  if (isConfirmed) {
    return <SVG src={OrderCheckImage} description="Order Filled" />
  }
  if (isExpired && isTransaction) {
    return <SVG src={OrderCancelledImage} description="Transaction Failed" />
  }
  if (isExpired) {
    return <SVG src={OrderExpiredImage} description="Order Expired" />
  }
  if (isFailed) {
    return <SVG src={OrderCancelledImage} description="Failed" />
  }
  if (isCreating) {
    // TODO: use another icon for Creating state
    return <SVG src={OrderExpiredImage} description="Creating Order" />
  }
  if (isCancelled) {
    return <SVG src={OrderCancelledImage} description="Order Cancelled" />
  }
  if (isPresignaturePending) {
    return <SVG src={PresignaturePendingImage} description="Pending pre-signature" />
  }
  if (isCancelling) {
    return null
  }
  return <SVG src={OrderOpenImage} description="Order Open" />
}

function _getSafeAddress(activityDerivedState: ActivityDerivedState): string | undefined {
  const { enhancedTransaction, order } = activityDerivedState

  return (
    enhancedTransaction?.safeTransaction?.safe ||
    order?.presignGnosisSafeTx?.safe ||
    activityDerivedState.gnosisSafeInfo?.address
  )
}

function _getCancellationTxLink(
  chainId: number,
  cancellationHash: string | undefined,
  isCancelling: boolean,
  isConfirmed: boolean,
  isCancelled: boolean,
  safeAddress: string | undefined,
): string | null {
  const hasCancellationHash = !!cancellationHash && !isCancelling && !isConfirmed && isCancelled

  if (!hasCancellationHash) {
    return null
  }

  return safeAddress
    ? getSafeWebUrl(chainId, safeAddress, cancellationHash)
    : getExplorerLink(chainId, cancellationHash, ExplorerDataType.TRANSACTION)
}

function _getStatusLabelProps(activityDerivedState: ActivityDerivedState): {
  isTransaction: boolean
  isPending: boolean
  isCancelling: boolean
  isPresignaturePending: boolean
  isCreating: boolean
  isLoading: boolean
  title: string
} {
  const { isTransaction, isPending, isCancelling, isPresignaturePending, isCreating, isLoading, isReplaced } =
    activityDerivedState

  return {
    isTransaction,
    isPending,
    isCancelling,
    isPresignaturePending,
    isCreating,
    isLoading: isLoading || false,
    title: isReplaced ? 'Transaction was cancelled or sped up' : '',
  }
}

export type StatusDetailsProps = {
  chainId: number
  activityDerivedState: ActivityDerivedState
  showCancellationModal: Command | null
  showProgressBar: Command | null
}

export function StatusDetails(props: StatusDetailsProps): ReactNode | null {
  const { chainId, activityDerivedState, showCancellationModal, showProgressBar } = props

  const {
    status,
    type,
    isCancelling,
    isConfirmed,
    isCancelled,
    isReplaced,
    isLoading,
    order,
  } = activityDerivedState

  const cancellationHash = activityDerivedState.order?.cancellationHash
  const isCancellable = order ? isOrderCancellable(order) : true

  const safeAddress = _getSafeAddress(activityDerivedState)

  const cancellationTxLink = _getCancellationTxLink(
    chainId,
    cancellationHash,
    isCancelling,
    isConfirmed,
    isCancelled,
    safeAddress,
  )

  const showCancelButton = showCancellationModal && isCancellable && !isCancelled
  const showCancelTxLink = !!cancellationTxLink
  const shouldShowStatusLabelBelow = showCancelButton || (showProgressBar && !isLoading) || showCancelTxLink

  const handleProgressClick = (e: React.MouseEvent): void => {
    e.preventDefault()
    showProgressBar?.()
  }

  return (
    <StatusLabelWrapper withCancellationHash$={!!cancellationHash}>
      <StatusLabel color={determinePillColour(status, type)} {..._getStatusLabelProps(activityDerivedState)}>
        {_getStatusIcon(activityDerivedState)}
        {isReplaced ? 'Replaced' : _getStateLabel(activityDerivedState)}
      </StatusLabel>

      {shouldShowStatusLabelBelow && (
        <StatusLabelBelow>
          {showCancelButton && <CancelButton onClick={showCancellationModal} />}
          {showProgressBar && !isLoading && (
            <ProgressLink
              role="button"
              onClick={handleProgressClick}
            >
              Show progress
            </ProgressLink>
          )}
          {showCancelTxLink && (
            <CancelTxLink href={cancellationTxLink} target="_blank" title="Cancellation transaction">
              <LinkIconFeather size={16} />
            </CancelTxLink>
          )}
        </StatusLabelBelow>
      )}
    </StatusLabelWrapper>
  )
}
