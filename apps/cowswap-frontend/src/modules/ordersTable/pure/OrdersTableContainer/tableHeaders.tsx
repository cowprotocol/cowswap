import { ReactNode } from 'react'

import { Trans } from '@lingui/macro'
import { Repeat } from 'react-feather'
import styled from 'styled-components/macro'

export enum ColumnLayout {
  DEFAULT = 'DEFAULT',
  VIEW_2 = 'VIEW_2',
  VIEW_3 = 'VIEW_3',
}

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
  columnLayout: ColumnLayout = ColumnLayout.DEFAULT,
): TableHeaderConfig[] => {
  const baseHeaders: TableHeaderConfig[] = [
    {
      id: 'checkbox',
      content: null,
    },
    {
      id: 'trade',
      content: <Trans>Sell &#x2192; Buy</Trans>,
    },
  ]

  const priceHeaders = (() => {
    switch (columnLayout) {
      case ColumnLayout.VIEW_2:
        return [
          {
            id: 'limitPrice',
            content: <Trans>Limit price</Trans>,
            showInHistory: false,
          },
          {
            id: 'fillsAt',
            content: <Trans>Fills at</Trans>,
            showInHistory: false,
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
          },
        ]
      case ColumnLayout.VIEW_3:
        return [
          {
            id: 'limitPrice',
            content: <Trans>Limit price</Trans>,
            showInHistory: false,
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
          },
          {
            id: 'marketPrice',
            content: <Trans>Market price</Trans>,
            showInHistory: false,
          },
        ]
      default:
        return [
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
            content: (
              <Trans>
                Distance <br />
                to market
              </Trans>
            ),
            showInHistory: false,
          },
          {
            id: 'marketPrice',
            content: <Trans>Market price</Trans>,
            showInHistory: false,
          },
        ]
    }
  })()

  const remainingHeaders: TableHeaderConfig[] = [
    {
      id: 'limitPrice',
      content: <Trans>Limit price</Trans>,
      showInHistory: true,
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

  return [...baseHeaders, ...priceHeaders, ...remainingHeaders]
}
