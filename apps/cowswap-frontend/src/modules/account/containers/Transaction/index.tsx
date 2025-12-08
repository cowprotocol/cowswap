import { ReactNode } from 'react'

import { RowFixed } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { i18n } from '@lingui/core'

import { ActivityState, useActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { ActivityDescriptors } from 'legacy/hooks/useRecentActivity'

import { ActivityStatus, ActivityType } from 'common/types/activity'

import { ActivityDetails } from './ActivityDetails'
import { TransactionStatusText as ActivityDetailsText, TransactionWrapper, Wrapper } from './styled'

const PILL_COLOUR_MAP = {
  CONFIRMED: 'success',
  PENDING_ORDER: ActivityState.PENDING,
  PRESIGNATURE_PENDING: ActivityState.PENDING,
  CREATING: ActivityState.PENDING,
  PENDING_TX: ActivityState.PENDING,
  LOADING: ActivityState.OPEN,
  EXPIRED_ORDER: 'alert',
  CANCELLED_ORDER: 'danger',
  CANCELLING_ORDER: 'danger',
  FAILED: 'danger',
}

export function determinePillColour(status: ActivityStatus, type: ActivityType): string {
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
    case ActivityStatus.LOADING:
      return PILL_COLOUR_MAP.LOADING
  }
}

export default function Activity({ activity }: { activity: ActivityDescriptors }): ReactNode | null {
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
  const creationTime = creationTimeFull?.toLocaleString(i18n.locale, timeFormatOptionHM)

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
              fillability={activity.fillability}
            />
          </ActivityDetailsText>
        </RowFixed>
      </TransactionWrapper>
    </Wrapper>
  )
}
