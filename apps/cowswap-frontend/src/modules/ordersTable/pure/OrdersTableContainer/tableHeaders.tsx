import { ReactNode } from 'react'

import { Trans } from '@lingui/macro'
import { Repeat } from 'react-feather'
import styled from 'styled-components/macro'

export enum ColumnLayout {
  DEFAULT = 'DEFAULT',
  VIEW_2 = 'VIEW_2',
  VIEW_3 = 'VIEW_3',
}

export const LAYOUT_MAP: Record<string, ColumnLayout> = {
  DEFAULT: ColumnLayout.DEFAULT,
  VIEW_2: ColumnLayout.VIEW_2,
  VIEW_3: ColumnLayout.VIEW_3,
} as const

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

// Price-related columns for different layouts
const PRICE_COLUMNS = {
  DEFAULT: (showLimitPrice: boolean, setShowLimitPrice: (value: boolean) => void): TableHeaderConfig[] => [
    {
      id: 'fillsAt',
      content: showLimitPrice ? <Trans>Limit price</Trans> : <Trans>Fills at</Trans>,
      showInHistory: false,
      order: 3,
      extraComponent: (
        <StyledArrowControl onClick={() => setShowLimitPrice(!showLimitPrice)}>
          <Repeat size={14} />
        </StyledArrowControl>
      ),
    },
    {
      id: 'distanceToMarket',
      content: (
        <Trans>
          Distance <br />
          to market
        </Trans>
      ),
      showInHistory: false,
      order: 4,
    },
    {
      id: 'marketPrice',
      content: <Trans>Market price</Trans>,
      showInHistory: false,
      order: 5,
    },
  ],
  VIEW_2: (): TableHeaderConfig[] => [
    {
      id: 'limitPrice',
      content: <Trans>Limit price</Trans>,
      showInHistory: false,
      order: 3,
    },
    {
      id: 'fillsAt',
      content: <Trans>Fills at</Trans>,
      showInHistory: false,
      order: 4,
    },
    {
      id: 'distanceToMarket',
      content: (
        <Trans>
          Distance <br />
          to market
        </Trans>
      ),
      showInHistory: false,
      order: 5,
    },
  ],
  VIEW_3: (): TableHeaderConfig[] => [
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
  ],
}

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

export const createTableHeaders = (
  showLimitPrice: boolean,
  setShowLimitPrice: (value: boolean) => void,
  columnLayout: ColumnLayout = ColumnLayout.DEFAULT,
): TableHeaderConfig[] => {
  // Get the appropriate price columns based on layout
  const priceColumns = (() => {
    switch (columnLayout) {
      case ColumnLayout.VIEW_2:
        return PRICE_COLUMNS.VIEW_2()
      case ColumnLayout.VIEW_3:
        return PRICE_COLUMNS.VIEW_3()
      default:
        return PRICE_COLUMNS.DEFAULT(showLimitPrice, setShowLimitPrice)
    }
  })()

  // Combine all columns and sort by order
  return [CORE_COLUMNS.CHECKBOX, CORE_COLUMNS.TRADE, ...priceColumns, ...DETAIL_COLUMNS].sort(
    (a, b) => a.order - b.order,
  )
}