import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import { TAB_QUERY_PARAM_KEY } from '../../../../explorer/const'
import { OrderSolverInfo } from '../../../../hooks/useOrderSolver'
import { DetailRow } from '../../../common/DetailRow'
import Spinner from '../../../common/Spinner'
import { DetailsTableTooltips } from '../detailsTableTooltips'
import { SolvedByBadge } from '../SolvedByBadge'
import { TextLink } from '../styled'

interface SolvedByItemProps {
  uid: string
  isSolvedByLoading?: boolean
  solvedBy?: OrderSolverInfo
  showFillsButton?: boolean
  viewFills: Command
}

export function SolvedByItem({
  uid,
  isSolvedByLoading,
  solvedBy,
  showFillsButton,
  viewFills,
}: SolvedByItemProps): ReactNode {
  return (
    <DetailRow label="Solved by" tooltipText={DetailsTableTooltips.solvedBy}>
      {showFillsButton ? (
        <TextLink onClickOptional={viewFills} to={`/orders/${uid}/?${TAB_QUERY_PARAM_KEY}=fills`}>
          View all solvers
        </TextLink>
      ) : isSolvedByLoading ? (
        <Spinner spin size="1x" />
      ) : (
        <SolvedByBadge solvedBy={solvedBy} />
      )}
    </DetailRow>
  )
}
