import { Fragment } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { useMultipleActivityDescriptors, groupActivitiesByDay } from 'legacy/hooks/useRecentActivity'

import { renderActivities } from '../AccountDetails'
import { AccountDetailsProps } from '../AccountDetails'
import { LowerSectionSimple, Wrapper } from '../AccountDetails/styled'

type StyledWrapperProps = { $margin?: string }
type SimpleAccountDetailsProps = Pick<AccountDetailsProps, 'pendingTransactions' | 'confirmedTransactions'> &
  StyledWrapperProps

const SimpleWrapper = styled(Wrapper)<StyledWrapperProps>`
  ${({ $margin }) => $margin && `margin: ${$margin};`}
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0;
  `};
`

export default function SimpleAccountDetails({
  pendingTransactions = [],
  confirmedTransactions = [],
  ...styleProps
}: SimpleAccountDetailsProps) {
  const { chainId } = useWalletInfo()

  const activities = useMultipleActivityDescriptors({ chainId, ids: pendingTransactions.concat(confirmedTransactions) })
  const activitiesGroupedByDate = groupActivitiesByDay(activities)

  if (!pendingTransactions.length && !confirmedTransactions.length) return null

  return (
    <SimpleWrapper {...styleProps}>
      <LowerSectionSimple>
        <div>
          {activitiesGroupedByDate.map(({ date, activities }) => (
            <Fragment key={date.getTime()}>{renderActivities(activities)}</Fragment>
          ))}
        </div>
      </LowerSectionSimple>
    </SimpleWrapper>
  )
}
