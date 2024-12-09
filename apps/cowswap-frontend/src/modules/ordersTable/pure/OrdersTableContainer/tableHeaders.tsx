import { ReactNode } from 'react'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { InvertRateControl } from 'common/pure/RateInfo'

const StyledInvertRateControl = styled(InvertRateControl)`
  display: inline-flex;
  margin-left: 5px;
`

export interface TableHeaderConfig {
  id: string
  content: ReactNode
  doubleRow?: boolean
  showInOpenOrders?: boolean
  showInClosedOrders?: boolean
  width?: string
  extraComponent?: ReactNode
}

export const createTableHeaders = (
  isRateInverted: boolean,
  setIsRateInverted: (value: boolean) => void,
): TableHeaderConfig[] => [
  {
    id: 'checkbox',
    content: null,
    showInOpenOrders: true,
  },
  {
    id: 'trade',
    content: <Trans>Sell &#x2192; Buy</Trans>,
    showInOpenOrders: true,
    showInClosedOrders: true,
  },
  {
    id: 'fillsAt',
    content: <Trans>Fills at</Trans>,
    showInOpenOrders: true,
  },
  {
    id: 'limitPrice',
    content: <Trans>Limit price</Trans>,
    showInOpenOrders: true,
    showInClosedOrders: true,
    extraComponent: <StyledInvertRateControl onClick={() => setIsRateInverted(!isRateInverted)} />,
  },
  {
    id: 'executesAt',
    content: (
      <>
        <span>
          <Trans>Order executes at</Trans>
        </span>
        <i>
          <Trans>Market price</Trans>
        </i>
      </>
    ),
    doubleRow: true,
    showInOpenOrders: true,
  },
  {
    id: 'marketPrice',
    content: <Trans>Market price</Trans>,
    showInOpenOrders: true,
  },
  {
    id: 'executionPrice',
    content: <Trans>Execution price</Trans>,
    showInClosedOrders: true,
  },
  {
    id: 'expiration',
    content: (
      <>
        <Trans>Expiration</Trans>
        <i>
          <Trans>Creation</Trans>
        </i>
      </>
    ),
    doubleRow: true,
    showInOpenOrders: true,
  },
  {
    id: 'filled',
    content: <Trans>Filled</Trans>,
    showInOpenOrders: true,
    showInClosedOrders: true,
  },
  {
    id: 'status',
    content: <Trans>Status</Trans>,
    showInOpenOrders: true,
    showInClosedOrders: true,
  },
  {
    id: 'actions',
    content: null,
    showInOpenOrders: true,
    showInClosedOrders: true,
  },
]
