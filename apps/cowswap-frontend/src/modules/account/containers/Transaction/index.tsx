import { RowFixed } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { ActivityDescriptors } from 'legacy/hooks/useRecentActivity'

import { ActivityStatus, ActivityType } from 'common/types/activity'

import { ActivityDetails } from './ActivityDetails'
import { TransactionStatusText as ActivityDetailsText, TransactionWrapper, Wrapper } from './styled'

const PILL_COLOUR_MAP = {
  CONFIRMED: 'success',
  PENDING_ORDER: 'pending',
  PRESIGNATURE_PENDING: 'pending',
  CREATING: 'pending',
  PENDING_TX: 'pending',
  EXPIRED_ORDER: 'alert',
  CANCELLED_ORDER: 'danger',
  CANCELLING_ORDER: 'danger',
  FAILED: 'danger',
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
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
