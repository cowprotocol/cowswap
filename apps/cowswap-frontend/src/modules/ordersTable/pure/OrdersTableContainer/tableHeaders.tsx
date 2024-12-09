import { ReactNode } from 'react'

import { Trans } from '@lingui/macro'
import { Repeat } from 'react-feather'
import styled from 'styled-components/macro'

const StyledArrowControl = styled.div`
  display: inline-flex;
  margin-left: 5px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }

  > svg {
    width: 14px;
    height: 14px;
  }
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
  showLimitPrice: boolean,
  setShowLimitPrice: (value: boolean) => void,
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
    content: showLimitPrice ? <Trans>Limit price</Trans> : <Trans>Fills at</Trans>,
    showInOpenOrders: true,
    extraComponent: (
      <StyledArrowControl onClick={() => setShowLimitPrice(!showLimitPrice)}>
        <Repeat size={14} />
      </StyledArrowControl>
    ),
  },
  {
    id: 'distanceToMarket',
    content: <Trans>Distance to market</Trans>,
    showInOpenOrders: true,
  },
  {
    id: 'limitPrice',
    content: <Trans>Limit price</Trans>,
    showInClosedOrders: true,
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
    id: 'executionTime',
    content: <Trans>Execution time</Trans>,
    showInClosedOrders: true,
  },
  {
    id: 'creationTime',
    content: <Trans>Creation time</Trans>,
    showInClosedOrders: true,
  },
  {
    id: 'filled',
    content: <Trans>Filled</Trans>,
    showInClosedOrders: true,
  },
  {
    id: 'status',
    content: <Trans>Status</Trans>,
    showInClosedOrders: true,
  },
  {
    id: 'actions',
    content: null,
    showInClosedOrders: true,
  },
]
