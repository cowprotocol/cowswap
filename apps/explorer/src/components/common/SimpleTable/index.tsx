import React from 'react'

import { Media } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

import { ScrollBarStyle } from '../../../explorer/styled'

const Wrapper = styled.div<{ columnViewMobile?: boolean }>`
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 0 2rem;
  ${ScrollBarStyle};

  ${({ columnViewMobile }) =>
    columnViewMobile &&
    css`
      ${Media.upToSmall()} {
        overflow: hidden;
        max-width: 100%;
        width: 100%;
      }
    `}
`

const Table = styled.table<{ $numColumns?: number; columnViewMobile?: boolean }>`
  margin: 0;
  border-collapse: collapse;
  width: 100%;
  max-width: 100%;
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1;
  background: transparent;
  color: ${({ theme }): string => theme.textPrimary1};
  position: relative;
  padding: 0 0 2rem;

  thead,
  tbody {
    width: 100%;
    font-size: inherit;
    line-height: inherit;
  }

  thead tr,
  tbody tr {
    text-align: left;
    font-size: inherit;
    line-height: inherit;

    &:hover {
      background-color: ${({ theme }): string => theme.background};
    }

    ${({ columnViewMobile }) =>
      columnViewMobile &&
      css`
        ${Media.upToSmall()} {
          display: flex;
          flex-flow: column wrap;
          gap: 1.4rem;
          padding: 2rem 1.4rem;
        }
      `}
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
    font-size: inherit;
    line-height: 1.2;
    vertical-align: middle;
    white-space: nowrap;

    ${({ columnViewMobile }) =>
      columnViewMobile &&
      css`
        ${Media.upToSmall()} {
          white-space: normal;
          word-break: break-all;
          padding: 0;
        }
      `}

    > span {
      display: flex;
      align-items: center;
    }

    &:first-child {
      font-weight: 500;
    }

    &:first-child {
      padding-left: 1rem;

      ${({ columnViewMobile }) =>
        columnViewMobile &&
        css`
          ${Media.upToSmall()} {
            padding: 0;
          }
        `}
    }

    &.long {
      border-left: 0.2rem solid var(--color-long);
    }

    &.short {
      color: var(--color-short);
      border-left: 0.2rem solid var(--color-short);
    }
  }

  thead th > span {
    gap: 0.5rem;
  }
`

export type SimpleTableProps = {
  header?: React.ReactNode
  body?: React.ReactNode
  className?: string
  numColumns?: number
  columnViewMobile?: boolean
}

export const SimpleTable = ({
  header,
  body,
  className,
  numColumns,
  columnViewMobile,
}: SimpleTableProps): React.ReactNode => (
  <Wrapper columnViewMobile={columnViewMobile}>
    <Table $numColumns={numColumns} className={className} columnViewMobile={columnViewMobile}>
      {header && <thead>{header}</thead>}
      <tbody>{body}</tbody>
    </Table>
  </Wrapper>
)
