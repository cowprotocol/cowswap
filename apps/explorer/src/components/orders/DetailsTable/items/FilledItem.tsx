import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import { faFill } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Order } from '../../../../api/operator'
import { TAB_QUERY_PARAM_KEY } from '../../../../explorer/const'
import { DetailRow } from '../../../common/DetailRow'
import { FilledProgress } from '../../FilledProgress'
import { DetailsTableTooltips } from '../detailsTableTooltips'
import { LinkButton, Wrapper } from '../styled'

interface FilledItemProps {
  order: Order
  showFillsButton?: boolean
  viewFills: Command
}

export function FilledItem({ order, showFillsButton, viewFills }: FilledItemProps): ReactNode {
  const { uid } = order

  return (
    <DetailRow label="Filled" tooltipText={DetailsTableTooltips.filled}>
      <FilledProgress order={order} />
      <Wrapper>
        {showFillsButton && (
          <LinkButton onClickOptional={viewFills} to={`/orders/${uid}/?${TAB_QUERY_PARAM_KEY}=fills`}>
            <FontAwesomeIcon icon={faFill} />
            View fills
          </LinkButton>
        )}
      </Wrapper>
    </DetailRow>
  )
}
