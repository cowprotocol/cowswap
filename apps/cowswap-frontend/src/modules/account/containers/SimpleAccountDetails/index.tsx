import { Fragment } from 'react'

import { Media } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { useMultipleActivityDescriptors, groupActivitiesByDay } from 'legacy/hooks/useRecentActivity'

import { usePendingOrdersFillability } from 'common/hooks/usePendingOrdersFillability'

import { AccountDetailsProps } from '../AccountDetails'
import { LowerSectionSimple, TransactionListWrapper, Wrapper } from '../AccountDetails/styled'
import { Activity } from '../Transaction'

type StyledWrapperProps = { $margin?: string }
type SimpleAccountDetailsProps = Pick<AccountDetailsProps, 'pendingTransactions' | 'confirmedTransactions'> &
  StyledWrapperProps

const SimpleWrapper = styled(Wrapper)<StyledWrapperProps>`
  ${({ $margin }) => $margin && `margin: ${$margin};`}
  ${Media.upToMedium()} {
    padding: 0;
  }
`

export function SimpleAccountDetails({
  pendingTransactions = [],
  confirmedTransactions = [],
  ...styleProps
}: SimpleAccountDetailsProps) {
  const { chainId } = useWalletInfo()

  const activities = useMultipleActivityDescriptors({ chainId, ids: pendingTransactions.concat(confirmedTransactions) })
  const activitiesGroupedByDate = groupActivitiesByDay(activities)
  const pendingOrdersFillability = usePendingOrdersFillability()

  if (!pendingTransactions.length && !confirmedTransactions.length) return null

  return (
    <SimpleWrapper {...styleProps}>
      <LowerSectionSimple>
        <div>
          {activitiesGroupedByDate.map(({ date, activities }) => (
            <Fragment key={date.getTime()}>
              <TransactionListWrapper>
                {activities.map((activity) => {
                  return (
                    <Activity
                      key={activity.id}
                      activity={activity}
                      fillability={pendingOrdersFillability[activity.id]}
                    />
                  )
                })}
              </TransactionListWrapper>
            </Fragment>
          ))}
        </div>
      </LowerSectionSimple>
    </SimpleWrapper>
  )
}
