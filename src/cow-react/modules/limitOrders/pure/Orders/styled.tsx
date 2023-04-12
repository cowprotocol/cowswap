import styled from 'styled-components/macro'
import { transparentize } from 'polished'
import { RateWrapper } from '@cow/common/pure/RateInfo'

export const TableHeader = styled.div<{ isOpenOrdersTab: boolean; isRowSelectable: boolean }>`
  --height: 50px;
  display: grid;
  gap: 16px;

  grid-template-columns: ${({ isOpenOrdersTab, isRowSelectable }) =>
    `${isRowSelectable && isOpenOrdersTab ? '0.2fr 3fr' : '3.2fr'} repeat(2,2fr) ${
      isOpenOrdersTab ? '2.5fr 1.4fr' : ''
    } 0.7fr 108px 24px`};
  grid-template-rows: minmax(var(--height), 1fr);
  align-items: center;
  border: none;
  border-bottom: 1px solid ${({ theme }) => transparentize(0.8, theme.text3)};
  padding: 0 12px;

  ${({ theme, isRowSelectable, isOpenOrdersTab }) => theme.mediaWidth.upToLargeAlt`
  grid-template-columns: ${`${
    isRowSelectable && isOpenOrdersTab ? '0.2fr minmax(200px,2fr)' : 'minmax(200px,2fr)'
  } repeat(2,minmax(110px,2fr)) ${
    isOpenOrdersTab ? 'minmax(140px,2.2fr) minmax(100px,1fr)' : ''
  } minmax(50px,1fr) 108px 24px`};
  `}
`

export const TableRow = styled(TableHeader)`
  background: transparent;
  transition: background 0.15s ease-in-out;

  &:hover {
    background: ${({ theme }) => transparentize(0.9, theme.text3)};
  }

  &:last-child {
    border-bottom: 0;
  }

  ${RateWrapper} {
    text-align: left;
  }
`

export const TableRowCheckbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`
