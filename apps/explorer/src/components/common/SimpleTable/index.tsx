import React from 'react'
import styled from 'styled-components'
import { media } from 'theme/styles/media'

const Wrapper = styled.table<{ $numColumns?: number }>`
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  background-color: transparent;
  color: ${({ theme }): string => theme.textPrimary1};
  height: auto;
  width: 100%;
  margin: 1.6rem auto 0;
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
      padding: 1.4rem 0;
      box-sizing: border-box;

      &:not(:last-of-type) {
        border-bottom: 0.1rem solid ${({ theme }): string => theme.tableRowBorder};
      }

      ${media.mobile} {
        display: flex;
        flex-flow: column wrap;
        height: auto;
        align-items: flex-start;
        justify-content: center;
        padding: 1.4rem 0;

        &:hover {
          background: var(--color-text-hover);
          > td {
            color: var(--color-text-primary);
          }
        }
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
      ${media.mobile} {
        margin: 0 0 1.2rem 0;
        font-weight: ${({ theme }): string => theme.fontBold};
      }
    }

    align-items: center;
    ${({ $numColumns }): string => ($numColumns ? `grid-template-columns: repeat(${$numColumns}, 1fr);` : '')}

    > th, 
    > td {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0 0.5rem;

      ${media.mobile} {
        padding: 0 1rem;
      }
    }
  }
`

export type Props = {
  header?: JSX.Element
  body?: JSX.Element
  className?: string
  numColumns?: number
}

export const SimpleTable = ({ header, body, className, numColumns }: Props): JSX.Element => (
  <Wrapper $numColumns={numColumns} className={className}>
    {header && <thead>{header}</thead>}
    <tbody>{body}</tbody>
  </Wrapper>
)
