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

const HeaderElement = styled.div<{ doubleRow?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 3px;

  i {
    font-style: normal;
    opacity: 0.7;
    font-size: 0.85em;
  }
`

export interface TableHeaderConfig {
  id: string
  content: ReactNode
  doubleRow?: boolean
  showInHistory?: boolean
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
  },
  {
    id: 'trade',
    content: <Trans>Sell &#x2192; Buy</Trans>,
  },
  {
    id: 'fillsAt',
    content: showLimitPrice ? <Trans>Limit price</Trans> : <Trans>Fills at</Trans>,
    showInHistory: false,
    extraComponent: (
      <StyledArrowControl onClick={() => setShowLimitPrice(!showLimitPrice)}>
        <Repeat size={14} />
      </StyledArrowControl>
    ),
  },
  {
    id: 'distanceToMarket',
    content: <Trans>Distance to market</Trans>,
    showInHistory: false,
  },
  {
    id: 'limitPrice',
    content: <Trans>Limit price</Trans>,
    showInHistory: true,
  },
  {
    id: 'marketPrice',
    content: <Trans>Market price</Trans>,
    showInHistory: false,
  },
  {
    id: 'expiration',
    content: (
      <HeaderElement doubleRow>
        <Trans>Expiration</Trans>
        <i>
          <Trans>Creation</Trans>
        </i>
      </HeaderElement>
    ),
    showInHistory: false,
    doubleRow: true,
  },
  {
    id: 'executionPrice',
    content: <Trans>Execution price</Trans>,
    showInHistory: true,
  },
  {
    id: 'executionTime',
    content: <Trans>Execution time</Trans>,
    showInHistory: true,
  },
  {
    id: 'creationTime',
    content: <Trans>Creation time</Trans>,
    showInHistory: true,
  },
  {
    id: 'filled',
    content: <Trans>Filled</Trans>,
  },
  {
    id: 'status',
    content: <Trans>Status</Trans>,
  },
  {
    id: 'actions',
    content: null,
  },
]
