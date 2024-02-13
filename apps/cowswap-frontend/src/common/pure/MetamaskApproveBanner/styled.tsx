import { UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import styled, { css } from 'styled-components/macro'

export const ApproveWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  padding: 26px 16px 32px;
  gap: 32px;
  color: inherit;

  > h3 {
    font-size: 21px;
    line-height: 1.2;
    font-weight: 400;
    text-align: center;
    width: 100%;
    margin: 0 auto;
    color: inherit;
  }
`

export const ApproveComparison = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: max-content;
  grid-gap: 16px;
  margin: 0 auto;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: column wrap;
    gap: 24px;
  `};
`

export const CompareItem = styled.div<{ highlight?: boolean; recommended?: boolean }>`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: flex-start;
  padding: 32px 24px;
  gap: 16px;
  border-radius: 12px;
  font-size: 13px;
  background: ${({ highlight }) => (highlight ? `var(${UI.COLOR_PAPER_DARKER})` : 'transparent')};
  border: 1px solid ${({ highlight }) => (highlight ? 'none' : `var(${UI.COLOR_TEXT_OPACITY_10})`)};
  position: relative;

  &::before {
    content: ${({ recommended }) => (recommended ? "'Recommended'" : 'none')};
    position: absolute;
    top: -7px;
    left: 0;
    right: 0;
    width: fit-content;
    border-radius: 12px;
    display: block;
    margin: 0 auto;
    padding: 2px 6px;
    text-transform: uppercase;
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 0.5px;
    text-align: center;
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});
  }

  > h5 {
    font-size: 21px;
    font-weight: ${({ highlight }) => (highlight ? 700 : 500)};
    margin: 0;
    padding: 0;
  }
`

export const ItemList = styled.div<{ listIconAlert?: boolean }>`
  margin: 0 auto;
  padding: 0;
  list-style: none;
  font-size: inherit;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  gap: 6px;
  display: flex;
  flex-flow: column wrap;

  > li {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  > li > svg {
    --size: 12px;
    display: inline-block;
    width: var(--size);
    height: var(--size);

    ${({ listIconAlert }) =>
      !listIconAlert &&
      css`
        > path:nth-child(1) {
          fill: var(${UI.COLOR_PRIMARY});
          opacity: 1;
        }

        > path:nth-child(2) {
          fill: var(${UI.COLOR_PRIMARY});
        }

        > path:nth-child(3) {
          fill: var(${UI.COLOR_BUTTON_TEXT});
        }
      `}

    ${({ listIconAlert }) =>
      listIconAlert &&
      css`
        > path {
          fill: ${({ theme }) => transparentize(theme.text, 0.6)};
        }
      `}
  }
`

export const ApproveFooter = styled.div`
  display: flex;
  flex-flow: column wrap;
  font-size: 13px;
  margin: 0 auto;

  > h6 {
    margin: 0 auto 16px;
    width: 100%;
    font-weight: 600;
    font-size: 14px;
    text-align: center;
  }

  > ul {
    margin: 0 auto;
    padding: 0;
    list-style: none;
    font-size: inherit;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
    gap: 6px;
    display: flex;
    flex-flow: column wrap;
  }

  > ul > li {
    display: flex;
    align-items: center;
  }

  > ul > li > svg {
    --size: 12px;
    display: inline-block;
    width: var(--size);
    height: var(--size);
    margin: 0 6px 0 0;

    > path:nth-child(1) {
      fill: var(${UI.COLOR_PRIMARY});
      opacity: 1;
    }

    > path:nth-child(2) {
      fill: var(${UI.COLOR_PRIMARY});
    }

    > path:nth-child(3) {
      fill: var(${UI.COLOR_BUTTON_TEXT});
    }
  }
`
