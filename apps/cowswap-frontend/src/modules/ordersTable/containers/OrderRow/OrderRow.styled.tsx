import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { RateWrapper } from 'common/pure/RateInfo'

import { TableHeaderWrapper } from '../../pure/OrdersTable/Header/OrdersTableHeader.styled'

export const TableRow = styled(TableHeaderWrapper)<{
  isChildOrder?: boolean
  isHistoryTab: boolean
  isRowSelectable: boolean
  isTwapTable?: boolean
  isExpanded?: boolean
}>`
  grid-template-rows: minmax(var(--row-height), 1fr);
  background: ${({ isChildOrder, isExpanded }) =>
    isExpanded && !isChildOrder
      ? `var(${UI.COLOR_INFO_BG})`
      : isChildOrder
        ? `var(${UI.COLOR_PAPER_DARKER})`
        : 'transparent'};
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
  display: grid;

  &:hover {
    background: ${({ isExpanded, isChildOrder }) =>
      isExpanded && !isChildOrder ? `var(${UI.COLOR_INFO_BG})` : `var(${UI.COLOR_PAPER_DARKER})`};
  }

  > div:first-child {
    margin-left: ${({ isChildOrder }) => (isChildOrder ? '5px' : '')};

    &::before {
      display: ${({ isChildOrder }) => (isChildOrder ? 'inline-block' : 'none')};
      color: inherit;
      content: '↳';
      text-decoration: none !important;
      opacity: 0.6;
    }
  }
`

export const StatusBox = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`

export const CellElement = styled.div<{
  clickable?: boolean
  doubleRow?: boolean
}>`
  padding: 0;
  font-size: 12px;
  font-weight: 500;
  gap: 5px;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: ${({ doubleRow }) => (doubleRow ? 'flex-start' : 'center')};
  text-align: left;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};

  > b {
    font-weight: 500;
    width: 100%;
    text-align: left;

    &[title] {
      cursor: help;
    }
  }

  > span[title] {
    cursor: help;
  }

  ${({ doubleRow }) =>
    doubleRow &&
    `
    flex-flow: column wrap;
    justify-content: center;
    gap: 2px;

    > i {
      opacity: 0.7;

      &[title] {
        cursor: help;
      }
    }
  `}
  ${RateWrapper} {
    font-weight: 500;
    font-size: 12px;
    white-space: normal;
    word-break: break-all;
  }
`

export const PriceElement = styled(CellElement)`
  cursor: pointer;
`

export const CurrencyCell = styled.div<{ clickable?: boolean }>`
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};

  &:hover {
    span {
      text-decoration: ${({ clickable }) => (clickable ? 'underline' : '')};
    }
  }
`

export const CurrencyAmountWrapper = styled.div<{ clickable?: boolean }>`
  display: flex;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'initial')};
  flex-flow: column wrap;
  gap: 2px;
`

export const ProgressBarWrapper = styled.div`
  flex: 1;
  align-items: center;
  flex-flow: row nowrap;
  gap: 8px;
  padding: 0;
  font-size: 12px;
  font-weight: 500;
  height: 100%;
  width: 100%;
  max-width: 190px;
  display: flex;
  text-align: left;
  background: transparent;
  justify-content: flex-start;
`

export const ProgressBar = styled.div<{ value: string }>`
  position: relative;
  margin: 0;
  height: 5px;
  width: 100%;
  background: var(${UI.COLOR_TEXT_OPACITY_10});
  border-radius: 6px;

  &::before {
    content: '';
    position: absolute;
    height: 100%;
    width: ${({ value }) => value}%;
    background: var(${UI.COLOR_SUCCESS});
    border-radius: 5px;
  }
`

export const FilledPercentageContainer = styled.div`
  display: grid;
  grid-template-columns: 50px 36px;
  gap: 4px;
  align-items: center;
  width: 100%;
`

export const ExecuteCellWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
`

export const ExecuteInformationTooltip = styled.div`
  padding: 0;
  margin: 0;
`

export const ExecuteInformationTooltipWarning = styled.div`
  font-weight: 500;
  margin-top: 12px;
`

export const CancelledDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(${UI.COLOR_DANGER});
  font-weight: 500;
  font-size: 12px;
`

export const ExpiredDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(${UI.COLOR_ALERT_TEXT});
`

export const FilledDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(${UI.COLOR_SUCCESS});
`

export const PendingExecutionDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(${UI.COLOR_TEXT});
  font-weight: 500;
  font-size: 12px;
`

export const SigningDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: help;
  color: var(${UI.COLOR_ALERT_TEXT});

  > svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }

  svg > path {
    fill: currentColor;
  }
`
