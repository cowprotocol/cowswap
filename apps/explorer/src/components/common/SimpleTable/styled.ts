import { Media, Color } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

import { ScrollBarStyle } from '../../../explorer/styled'

export const Wrapper = styled.div<{ columnViewMobile?: boolean }>`
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

export const Table = styled.table<{ $numColumns?: number; columnViewMobile?: boolean }>`
  margin: 0;
  border-collapse: collapse;
  width: 100%;
  max-width: 100%;
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1;
  background: transparent;
  color: ${Color.explorer_textPrimary};
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
      background-color: ${Color.explorer_background};
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
    border-bottom: 1px solid ${Color.explorer_tableRowBorder};
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
      border-left: 0.2rem solid ${Color.explorer_green1};
    }

    &.short {
      color: ${Color.explorer_red1};
      border-left: 0.2rem solid ${Color.explorer_red1};
    }
  }

  thead th > span {
    gap: 0.5rem;
  }
`
