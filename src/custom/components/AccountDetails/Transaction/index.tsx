import { SafeInfoResponse } from '@gnosis.pm/safe-service-client'

import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { RowFixed } from 'components/Row'

import { TransactionStatusText as ActivityDetailsText, TransactionWrapper, Wrapper } from './styled'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'
import { ActivityDescriptors, ActivityStatus, ActivityType } from 'hooks/useRecentActivity'

import { StatusDetails } from './StatusDetails'
// import { StateIcon } from './StateIcon'
import { Order } from 'state/orders/actions'
import { useActivityDerivedState } from 'hooks/useActivityDerivedState'
import { ActivityDetails } from './ActivityDetails'

const PILL_COLOUR_MAP = {
  CONFIRMED: 'success',
  PENDING_ORDER: 'pending',
  PRESIGNATURE_PENDING: 'pending',
  PENDING_TX: 'pending',
  EXPIRED_ORDER: 'attention',
  CANCELLED_ORDER: 'attention',
  CANCELLING_ORDER: 'attention',
}

export function determinePillColour(status: ActivityStatus, type: ActivityType) {
  const isOrder = type === ActivityType.ORDER

  switch (status) {
    case ActivityStatus.PENDING:
      return isOrder ? PILL_COLOUR_MAP.PENDING_ORDER : PILL_COLOUR_MAP.PENDING_TX
    case ActivityStatus.PRESIGNATURE_PENDING:
      return PILL_COLOUR_MAP.PRESIGNATURE_PENDING
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

/**
 * Object derived from the activity state
 */
export interface ActivityDerivedState {
  id: string
  status: ActivityStatus
  type: ActivityType
  summary?: string
  activityLinkUrl?: string

  // Convenient flags
  isTransaction: boolean
  isOrder: boolean
  isPending: boolean
  isConfirmed: boolean
  isExpired: boolean
  isCancelling: boolean
  isCancelled: boolean
  isPresignaturePending: boolean
  isUnfillable?: boolean
  isCancellable: boolean

  // Possible activity types
  enhancedTransaction?: EnhancedTransactionDetails
  order?: Order

  // Gnosis Safe
  gnosisSafeInfo?: SafeInfoResponse
}

export default function Activity({ activity }: { activity: ActivityDescriptors }) {
  const { chainId } = useActiveWeb3React()

  // Get some derived information about the activity. It helps to simplify the rendering of the sub-components
  const activityDerivedState = useActivityDerivedState({ chainId, activity })

  if (!activityDerivedState || !chainId) return null
  const { activityLinkUrl } = activityDerivedState
  const hasLink = activityLinkUrl !== null

  const creationTimeEnhanced = activityDerivedState?.enhancedTransaction?.addedTime
  const creationTimeOrder = activityDerivedState?.order?.creationTime
  const creationTimeFull = creationTimeEnhanced
    ? new Date(creationTimeEnhanced)
    : creationTimeOrder
    ? new Date(Date.parse(creationTimeOrder))
    : undefined

  const timeFormatOptionHM: Intl.DateTimeFormatOptions = {
    timeStyle: 'short',
  }

  // Hour:Minute
  const creationTime = creationTimeFull?.toLocaleString(undefined, timeFormatOptionHM)

  return (
    <Wrapper>
      <TransactionWrapper>
        <RowFixed>
          {/* Details of activity: transaction/order details */}
          <ActivityDetailsText>
            <ActivityDetails
              chainId={chainId}
              activityDerivedState={activityDerivedState}
              activityLinkUrl={activityLinkUrl ?? undefined}
              disableMouseActions={!hasLink}
              creationTime={creationTime && creationTime}
            />
          </ActivityDetailsText>
        </RowFixed>

        {/* Status Details: icon, cancel, links */}
        <StatusDetails chainId={chainId} activityDerivedState={activityDerivedState} />
      </TransactionWrapper>
    </Wrapper>
  )
}
