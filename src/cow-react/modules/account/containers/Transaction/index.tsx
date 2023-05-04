import { SafeInfoResponse } from '@safe-global/api-kit'

import { RowFixed } from 'components/Row'

import { TransactionStatusText as ActivityDetailsText, TransactionWrapper, Wrapper } from './styled'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'
import { ActivityDescriptors, ActivityStatus, ActivityType } from 'hooks/useRecentActivity'

// import { StateIcon } from './StateIcon'
import { Order } from 'state/orders/actions'
import { useActivityDerivedState } from 'hooks/useActivityDerivedState'
import { ActivityDetails } from './ActivityDetails'
import { useWalletInfo } from '@cow/modules/wallet'

const PILL_COLOUR_MAP = {
  CONFIRMED: 'success',
  PENDING_ORDER: 'pending',
  PRESIGNATURE_PENDING: 'pending',
  CREATING: 'pending',
  PENDING_TX: 'pending',
  EXPIRED_ORDER: 'attention',
  CANCELLED_ORDER: 'attention',
  CANCELLING_ORDER: 'attention',
  FAILED: 'attention',
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
    case ActivityStatus.CREATING:
      return PILL_COLOUR_MAP.CREATING
    case ActivityStatus.FAILED:
      return PILL_COLOUR_MAP.FAILED
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
  // EthFlow flags
  isCreating: boolean
  isFailed: boolean
  // TODO: refactor these convenience flags

  // Possible activity types
  enhancedTransaction?: EnhancedTransactionDetails
  order?: Order

  // Gnosis Safe
  gnosisSafeInfo?: SafeInfoResponse
}

export default function Activity({ activity }: { activity: ActivityDescriptors }) {
  const { chainId } = useWalletInfo()

  // Get some derived information about the activity. It helps to simplify the rendering of the subcomponents
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
      </TransactionWrapper>
    </Wrapper>
  )
}
