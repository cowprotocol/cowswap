import { ReactNode } from 'react'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

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
  order: number
}

// Core columns that appear in all views
const CORE_COLUMNS = {
  CHECKBOX: {
    id: 'checkbox',
    content: null,
    order: 1,
  },
  TRADE: {
    id: 'trade',
    content: <Trans>Sell &#x2192; Buy</Trans>,
    order: 2,
  },
}

// Price columns for the standard layout
const PRICE_COLUMNS: TableHeaderConfig[] = [
  {
    id: 'limitPrice',
    content: <Trans>Limit price</Trans>,
    showInHistory: false,
    order: 3,
  },
  {
    id: 'fillsAtWithDistance',
    content: (
      <HeaderElement doubleRow>
        <Trans>Fills at</Trans>
        <i>
          <Trans>Distance to market</Trans>
        </i>
      </HeaderElement>
    ),
    showInHistory: false,
    doubleRow: true,
    order: 4,
  },
  {
    id: 'marketPrice',
    content: <Trans>Market price</Trans>,
    showInHistory: false,
    order: 5,
  },
]

// Columns that appear after price columns
const DETAIL_COLUMNS: TableHeaderConfig[] = [
  {
    id: 'limitPrice',
    content: <Trans>Limit price</Trans>,
    showInHistory: true,
    order: 6,
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
    order: 7,
  },
  {
    id: 'executionPrice',
    content: <Trans>Execution price</Trans>,
    showInHistory: true,
    order: 8,
  },
  {
    id: 'executionTime',
    content: <Trans>Execution time</Trans>,
    showInHistory: true,
    order: 9,
  },
  {
    id: 'creationTime',
    content: <Trans>Creation time</Trans>,
    showInHistory: true,
    order: 10,
  },
  {
    id: 'filled',
    content: <Trans>Filled</Trans>,
    order: 11,
  },
  {
    id: 'status',
    content: <Trans>Status</Trans>,
    order: 12,
  },
  {
    id: 'actions',
    content: null,
    order: 13,
  },
]

export const createTableHeaders = (): TableHeaderConfig[] => {
  // Combine all columns and sort by order
  return [CORE_COLUMNS.CHECKBOX, CORE_COLUMNS.TRADE, ...PRICE_COLUMNS, ...DETAIL_COLUMNS].sort(
    (a, b) => a.order - b.order,
  )
}
