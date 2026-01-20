import { ReactNode } from 'react'

import { RowFixed } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { i18n } from '@lingui/core'

import { useActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { ActivityDescriptors } from 'legacy/hooks/useRecentActivity'

import { ActivityDetails } from './ActivityDetails'
import { TransactionStatusText as ActivityDetailsText, TransactionWrapper, Wrapper } from './styled'

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
