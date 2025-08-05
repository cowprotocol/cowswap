import { ReactNode } from 'react'

import type { ActivityDescriptors } from 'legacy/hooks/useRecentActivity'

import { TransactionListWrapper } from './styled'

import Activity from '../Transaction'

export function ActivitiesList({ activities }: { activities: ActivityDescriptors[] }): ReactNode {
  return (
    <TransactionListWrapper>
      {activities.map((activity) => {
        return <Activity key={activity.id} activity={activity} />
      })}
    </TransactionListWrapper>
  )
}
