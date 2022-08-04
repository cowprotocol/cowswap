import { Fragment } from 'react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useMultipleActivityDescriptors, groupActivitiesByDay } from 'hooks/useRecentActivity'
import { supportedChainId } from 'utils/supportedChainId'
import { LowerSectionSimple, Wrapper, NoActivityMessage } from './styled'
import { renderActivities } from './AccountDetailsMod'
import { AccountDetailsProps } from '.'
import styled from 'styled-components/macro'

type SimpleAccountDetailsProps = Pick<AccountDetailsProps, 'pendingTransactions' | 'confirmedTransactions'>

const SimpleWrapper = styled(Wrapper)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0;
  `};
`

export default function SimpleAccountDetails({
  pendingTransactions = [],
  confirmedTransactions = [],
}: SimpleAccountDetailsProps) {
  const { chainId: connectedChainId } = useActiveWeb3React()
  const chainId = supportedChainId(connectedChainId)

  const activities =
    useMultipleActivityDescriptors({ chainId, ids: pendingTransactions.concat(confirmedTransactions) }) || []
  const activitiesGroupedByDate = groupActivitiesByDay(activities)

  return (
    <SimpleWrapper>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <LowerSectionSimple>
          <div>
            {activitiesGroupedByDate.map(({ date, activities }) => (
              <Fragment key={date.getTime()}>{renderActivities(activities)}</Fragment>
            ))}
          </div>
        </LowerSectionSimple>
      ) : (
        <LowerSectionSimple>
          <NoActivityMessage>Your activity will appear here...</NoActivityMessage>
        </LowerSectionSimple>
      )}
    </SimpleWrapper>
  )
}
