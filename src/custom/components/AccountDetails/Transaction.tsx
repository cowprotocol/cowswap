import React from 'react'
import { AlertCircle, CheckCircle, Triangle } from 'react-feather'

import { useActiveWeb3React } from 'hooks'
import { getEtherscanLink } from 'utils'
import { RowFixed } from 'components/Row'
import Loader from 'components/Loader'
import {
  TransactionWrapper,
  TransactionState as OldTransactionState,
  TransactionStatusText,
  IconWrapper
} from './TransactionMod'
import Pill from '../Pill'
import styled from 'styled-components'

import { ActivityStatus, ActivityType, useActivityDescriptors } from 'hooks/useRecentActivity'

const PILL_COLOUR_MAP = {
  CONFIRMED: '#1b7b43',
  PENDING_ORDER: '#8958FF',
  PENDING_TX: '#2b68fa',
  EXPIRED_ORDER: '#b94d54'
}

function determinePillColour(status: ActivityStatus, type: ActivityType) {
  const isOrder = type === ActivityType.ORDER
  switch (status) {
    case ActivityStatus.PENDING:
      return isOrder ? PILL_COLOUR_MAP.PENDING_ORDER : PILL_COLOUR_MAP.PENDING_TX
    case ActivityStatus.CONFIRMED:
      return PILL_COLOUR_MAP.CONFIRMED
    case ActivityStatus.EXPIRED:
      return PILL_COLOUR_MAP.EXPIRED_ORDER
  }
}

function getActivitySummary({
  id,
  activityData
}: {
  id: string
  activityData: ReturnType<typeof useActivityDescriptors>
}) {
  if (!activityData) return null

  const { summary, status, type } = activityData

  const isMeta = type === ActivityType.ORDER && status !== ActivityStatus.CONFIRMED

  // add arrow indiciating clickable link if not meta tx
  const suffix = !isMeta ? ' ↗' : ''
  const baseSummary = summary ?? id

  return baseSummary + suffix
}

// override the href, pending and success props
// override mouse actions via CSS when we dont want a clickable row
const TransactionState = styled(OldTransactionState).attrs(
  (props): { href?: string; disableMouseActions?: boolean; pending?: boolean; success?: boolean } => props
)`
  ${(props): string | false => !!props.disableMouseActions && `pointer-events: none; cursor: none;`}
`

export default function Transaction({ hash: id }: { hash: string }) {
  const { chainId } = useActiveWeb3React()
  // Return info necessary for rendering order/transaction info from the incoming id
  // returns info related to activity: TransactionDetails | Order
  const activityData = useActivityDescriptors({ id, chainId })

  if (!activityData || !chainId) return null

  const { activity, status, type } = activityData

  const isOrder = type === ActivityType.ORDER

  const isPending = status === ActivityStatus.PENDING
  const isConfirmed = status === ActivityStatus.CONFIRMED
  const isExpired = status === ActivityStatus.EXPIRED

  return (
    <TransactionWrapper>
      <TransactionState
        // trnsaction? fulfilled order? render etherscan link. meta-tx? don't do that
        href={!isOrder ? getEtherscanLink(chainId, id, 'transaction') : undefined}
        // prevent pointer-events & cursor render on meta tx
        disableMouseActions={isOrder && !isConfirmed}
      >
        <RowFixed>
          {activity && (
            <Pill color="#fff" bgColor={determinePillColour(status, type)} minWidth="3.5rem">
              {type}
            </Pill>
          )}
          <TransactionStatusText>{getActivitySummary({ activityData, id })}</TransactionStatusText>
        </RowFixed>
        <IconWrapper pending={isPending} success={isConfirmed}>
          {isPending ? (
            <Loader />
          ) : isConfirmed ? (
            <CheckCircle size="16" />
          ) : isExpired ? (
            <AlertCircle size="16" />
          ) : (
            <Triangle size="16" />
          )}
        </IconWrapper>
      </TransactionState>
    </TransactionWrapper>
  )
}
