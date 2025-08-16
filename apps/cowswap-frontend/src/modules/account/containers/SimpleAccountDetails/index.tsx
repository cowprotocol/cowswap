import { Fragment, ReactNode } from 'react'

import { Media } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { groupActivitiesByDay, useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'

import { AccountDetailsProps } from '../AccountDetails'
import { ActivitiesList } from '../AccountDetails/ActivitiesList'
import { LowerSectionSimple, Wrapper } from '../AccountDetails/styled'

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
}: SimpleAccountDetailsProps): ReactNode | null {
  const { chainId } = useWalletInfo()

  const activities = useMultipleActivityDescriptors({ chainId, ids: pendingTransactions.concat(confirmedTransactions) })
  const activitiesGroupedByDate = groupActivitiesByDay(activities)

  if (!pendingTransactions.length && !confirmedTransactions.length) return null

  return (
    <SimpleWrapper {...styleProps}>
      <LowerSectionSimple>
        <div>
          {activitiesGroupedByDate.map(({ date, activities }) => (
            <Fragment key={date.getTime()}>
              <ActivitiesList activities={activities} />
            </Fragment>
          ))}
        </div>
      </LowerSectionSimple>
    </SimpleWrapper>
  )
}
