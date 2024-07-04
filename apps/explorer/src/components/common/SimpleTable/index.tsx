import React from 'react'

import styled from 'styled-components/macro'

import { ScrollBarStyle } from '../../../explorer/styled'

const Wrapper = styled.div`
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 0 2rem;

  ${ScrollBarStyle};
`

const Table = styled.table<{ $numColumns?: number }>`
  margin: 0;
  border-collapse: collapse;
  width: 100%;
  max-width: 100%;
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  background: transparent;
  color: ${({ theme }): string => theme.textPrimary1};
  position: relative;
  padding: 0 0 2rem;

  thead,
  tbody {
    width: 100%;
  }

  thead tr,
  tbody tr {
    text-align: left;

    &:hover {
      background-color: ${({ theme }): string => theme.background};
    }
  }

  thead tr.row-empty,
  tbody tr.row-empty {
    padding: 0;
  }

  thead tr:not(:last-of-type),
  tbody tr:not(:last-of-type) {
    border-bottom: 0.1rem solid rgba(151, 151, 184, 0.1);
  }

  thead th,
  tbody td {
    padding: 1.2rem 1rem;
    line-height: 1.2;
    vertical-align: middle;
    white-space: nowrap;

    > span {
      display: flex;
      align-items: center;
    }

    &:first-child {
      padding-left: 1rem;
    }

    &.long {
      border-left: 0.2rem solid var(--color-long);
    }

    &.short {
      color: var(--color-short);
      border-left: 0.2rem solid var(--color-short);
    }
  }
`

export type SimpleTableProps = {
  header?: React.ReactNode
  body?: React.ReactNode
  className?: string
  numColumns?: number
}

export const SimpleTable = ({ header, body, className, numColumns }: SimpleTableProps): React.ReactNode => (
  <Wrapper>
    <Table $numColumns={numColumns} className={className}>
      {header && <thead>{header}</thead>}
      <tbody>{body}</tbody>
    </Table>
  </Wrapper>
)
