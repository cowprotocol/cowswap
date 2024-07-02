import { Media, UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

import { StyledRowBetween } from 'modules/swap/pure/Row/styled'

export const Wrapper = styled.div<{ alwaysRow: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  gap: 6px;
  width: 100%;
  font-size: 13px;

  ${Media.upToSmall()} {
    ${({ alwaysRow }) =>
      !alwaysRow &&
      css`
        width: 100%;
        flex-flow: column wrap;
        align-items: flex-start;
        margin: 0 0 10px;
      `}
  }

  > svg:first-child {
    margin: 0 4px 0 0;
    color: inherit;
    opacity: 0.5;
  }

  ${StyledRowBetween} {
    ${Media.upToSmall()} {
      ${({ alwaysRow }) =>
        !alwaysRow &&
        css`
          flex-flow: column wrap;
          gap: 2px;
          align-items: flex-start;
        `}
    }
  }
`

export const Row = styled(StyledRowBetween)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const Content = styled.div<{ highlighted?: boolean }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-end;
  margin: 0 0 0 auto;
  font-weight: ${({ highlighted }) => (highlighted ? 700 : 500)};
  font-size: 13px;

  ${Media.upToSmall()} {
    margin: 0;
  }

  > span {
    display: block;
    text-align: right;
    word-break: break-all;
  }

  i {
    font-style: normal;
    opacity: 0.7;
    word-break: break-all;
    text-align: right;
  }
`

export const Label = styled.span<{ labelOpacity?: boolean }>`
  display: flex;
  align-items: center;
  font-weight: 400;
  gap: 5px;
  text-align: left;
  opacity: ${({ labelOpacity }) => (labelOpacity ? 0.7 : 1)};
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out, opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  color: inherit;

  &:hover {
    opacity: 1;
  }
`
