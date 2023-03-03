import { Fragment } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useMultipleActivityDescriptors, groupActivitiesByDay } from 'hooks/useRecentActivity'
import { supportedChainId } from 'utils/supportedChainId'
import { LowerSectionSimple, Wrapper } from '../AccountDetails/styled'
import { renderActivities } from '../AccountDetails'
import { AccountDetailsProps } from '../AccountDetails'
import styled from 'styled-components/macro'

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
  const { chainId: connectedChainId } = useWeb3React()
  const chainId = supportedChainId(connectedChainId)

  const activities =
    useMultipleActivityDescriptors({ chainId, ids: pendingTransactions.concat(confirmedTransactions) }) || []
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
