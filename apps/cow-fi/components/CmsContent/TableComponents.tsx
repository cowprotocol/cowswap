import type { ReactNode, HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  margin: 1.6rem 0 2.4rem;
  border-radius: 0.8rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(${UI.COLOR_NEUTRAL_70}) var(${UI.COLOR_NEUTRAL_90});

  &::-webkit-scrollbar {
    width: 0.8rem;
    height: 0.8rem;
  }

  &::-webkit-scrollbar-track {
    background: var(${UI.COLOR_NEUTRAL_90});
    border-radius: 1rem;
  }

  &::-webkit-scrollbar-thumb {
    background: var(${UI.COLOR_NEUTRAL_70});
    border-radius: 1rem;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(${UI.COLOR_NEUTRAL_50});
  }

  ${Media.upToMedium()} {
    margin: 1.2rem 0 2rem;
    overflow-x: auto;
  }
`

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1.6rem;
  line-height: 1.5;
  color: var(${UI.COLOR_NEUTRAL_0});
  background: var(${UI.COLOR_PAPER});

  ${Media.upToMedium()} {
    font-size: 1.4rem;
    min-width: 60rem;
  }
`

const StyledTh = styled.th`
  padding: 1.2rem 1.6rem;
  text-align: left;
  font-weight: 600;
  font-size: inherit;
  line-height: inherit;
  color: var(${UI.COLOR_NEUTRAL_0});
  background: var(${UI.COLOR_PAPER_DARKER});
  border-bottom: 1px solid var(${UI.COLOR_NEUTRAL_90});
  white-space: nowrap;

  ${Media.upToMedium()} {
    padding: 1rem 1.2rem;
    white-space: normal;
  }
`

const StyledTd = styled.td`
  padding: 1.2rem 1.6rem;
  text-align: left;
  font-size: inherit;
  line-height: inherit;
  color: var(${UI.COLOR_NEUTRAL_0});
  border-bottom: 1px solid var(${UI.COLOR_NEUTRAL_95});
  vertical-align: top;

  ${Media.upToMedium()} {
    padding: 1rem 1.2rem;
  }
`

export const CustomTable = ({ children, ...props }: TableHTMLAttributes<HTMLTableElement>): ReactNode => (
  <TableWrapper>
    <StyledTable {...props}>{children}</StyledTable>
  </TableWrapper>
)

export const CustomTHead = ({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>): ReactNode => (
  <thead {...props}>{children}</thead>
)

export const CustomTBody = ({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>): ReactNode => (
  <tbody {...props}>{children}</tbody>
)

export const CustomTr = ({ children, ...props }: HTMLAttributes<HTMLTableRowElement>): ReactNode => (
  <tr {...props}>{children}</tr>
)

export const CustomTh = ({ children, ...props }: ThHTMLAttributes<HTMLTableCellElement>): ReactNode => (
  <StyledTh {...props}>{children}</StyledTh>
)

export const CustomTd = ({ children, ...props }: TdHTMLAttributes<HTMLTableCellElement>): ReactNode => (
  <StyledTd {...props}>{children}</StyledTd>
)
