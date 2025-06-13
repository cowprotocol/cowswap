import { Fragment } from 'react'

import { Media } from '@cowprotocol/ui'
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
  ${Media.upToMedium()} {
    padding: 0;
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SimpleAccountDetails({
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
