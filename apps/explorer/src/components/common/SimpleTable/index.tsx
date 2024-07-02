import React from 'react'

import styled from 'styled-components/macro'
import { Media } from '@cowprotocol/ui'

const Wrapper = styled.table<{ $numColumns?: number }>`
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  background-color: transparent;
  color: ${({ theme }): string => theme.textPrimary1};
  height: auto;
  width: 100%;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  border-spacing: 0;
  display: inline-grid;
  grid-template-areas:
    'head-fixed'
    'body-scrollable';

  > thead {
    grid-area: head-fixed;
    position: sticky;
    top: 0;
    height: auto;
    display: flex;
    align-items: center;

    > tr {
      color: var(--color-text-secondary2);
      display: grid;
      width: calc(100% - 0.6rem);
      background: transparent;
      ${({ $numColumns }): string => ($numColumns ? `grid-template-columns: repeat(${$numColumns}, 1fr);` : '')}
      grid-template-rows: max-content;

      > th {
        font-weight: var(--font-weight-normal);
      }
    }
  }

  > tbody {
    grid-area: body-scrollable;
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    box-sizing: border-box;
    padding: 0;

    > tr {
      display: grid;
      width: 100%;
      transition: background-color 0.1s ease-in-out;
      min-height: 4.8rem;
      padding: 1rem 0;
      box-sizing: border-box;

      &:not(:last-of-type) {
        border-bottom: 0.1rem solid ${({ theme }): string => theme.tableRowBorder};
      }
    }
  }

  tr {
    text-align: left;
    padding: 0;

    > td {
      padding: 0;
      transition: color 0.1s ease-in-out;
      box-sizing: border-box;
      line-height: 1.3;
    }

    > td:first-of-type {
      ${Media.upToSmall()} {
        margin: 0 0 1.2rem 0;
      }
    }

    align-items: center;
    ${({ $numColumns }): string => ($numColumns ? `grid-template-columns: repeat(${$numColumns}, 1fr);` : '')}
    grid-template-rows: max-content;

    > th,
    > td {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0 0.8rem;

      &:first-child {
        padding: 0 0 0 1.6rem;
        margin: 0;
      }

      ${Media.upToSmall()} {
        padding: 0 1rem;
      }
    }
  }
`

export type Props = {
  header?: React.ReactNode
  body?: React.ReactNode
  className?: string
  numColumns?: number
}

export const SimpleTable = ({ header, body, className, numColumns }: Props): React.ReactNode => (
  <Wrapper $numColumns={numColumns} className={className}>
    {header && <thead>{header}</thead>}
    <tbody>{body}</tbody>
  </Wrapper>
)
