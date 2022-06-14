import SVG from 'react-inlinesvg'
import { ExternalLink } from 'theme'

import OrderCheckImage from 'assets/cow-swap/order-check.svg'
import OrderExpiredImage from 'assets/cow-swap/order-expired.svg'
import OrderCancelledImage from 'assets/cow-swap/order-cancelled.svg'

import PresignaturePendingImage from 'assets/cow-swap/order-presignature-pending.svg'
import OrderOpenImage from 'assets/cow-swap/order-open.svg'

import { StatusLabel, StatusLabelWrapper, StatusLabelBelow } from './styled'
import { ActivityDerivedState, determinePillColour } from './index'
import { getSafeWebUrl } from 'api/gnosisSafe'
import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import { CancelButton } from './CancelButton'

export function GnosisSafeLink(props: {
  chainId: number
  safeTransaction?: SafeMultisigTransactionResponse
  gnosisSafeThreshold: number
}): JSX.Element | null {
  const { chainId, safeTransaction } = props

  if (!safeTransaction) {
    return null
  }

  const { safe } = safeTransaction
  const safeUrl = getSafeWebUrl(chainId, safe)

  // Only show the link to the safe, if we have the "safeUrl"
  if (safeUrl === null) {
    return null
  }

  return <ExternalLink href={safeUrl}>View Gnosis Safe ↗</ExternalLink>
}

function _getStateLabel({
  isPending,
  isOrder,
  isConfirmed,
  isExpired,
  isCancelling,
  isPresignaturePending,
  isCancelled,
  enhancedTransaction,
}: ActivityDerivedState) {
  if (isPending) {
    if (enhancedTransaction) {
      console.log('enhancedTransaction', enhancedTransaction)
      const { safeTransaction, transactionHash } = enhancedTransaction
      if (safeTransaction && !transactionHash) {
        return 'Signing...'
      }
    }

    return isOrder ? 'Open' : 'Pending...'
  }

  if (isConfirmed) {
    return isOrder ? 'Filled' : 'Executed'
  }

  if (isExpired) {
    return isOrder ? 'Expired' : 'Failed'
  }

  if (isCancelling) {
    return 'Cancelling...'
  }

  if (isPresignaturePending) {
    return 'Signing...'
  }

  if (isCancelled) {
    return 'Cancelled'
  }

  return 'Open'
}

export function StatusDetails(props: { chainId: number; activityDerivedState: ActivityDerivedState }) {
  const { activityDerivedState, chainId } = props

  const {
    status,
    type,
    isPending,
    isCancelling,
    isPresignaturePending,
    isConfirmed,
    isExpired,
    isTransaction,
    isCancelled,
    isCancellable,
  } = activityDerivedState

  return (
    <StatusLabelWrapper>
      <StatusLabel
        color={determinePillColour(status, type)}
        isTransaction={isTransaction}
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
          <SVG src={PresignaturePendingImage} description="Pending pre-signature" />
        ) : isCancelling ? null : (
          <SVG src={OrderOpenImage} description="Order Open" />
        )}
        {_getStateLabel(activityDerivedState)}
      </StatusLabel>

      {isCancellable && (
        <StatusLabelBelow>
          {/* Cancel order */}
          <CancelButton chainId={chainId} activityDerivedState={activityDerivedState} />
        </StatusLabelBelow>
      )}
    </StatusLabelWrapper>
  )
}
