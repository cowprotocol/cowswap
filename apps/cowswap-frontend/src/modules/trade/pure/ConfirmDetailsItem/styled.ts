import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { StyledRowBetween } from 'modules/tradeWidgetAddons/pure/Row/styled'

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
  font-size: 13px;
  min-height: 20px;

  > svg:first-child {
    margin: 0 4px 0 0;
    color: inherit;
    opacity: 0.5;
  }
`

export const Row = styled(StyledRowBetween)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const Content = styled.div<{ highlighted?: boolean; contentTextColor?: string }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-end;
  margin: 0 0 0 auto;
  flex: 1 1 auto;
  font-weight: ${({ highlighted }) => (highlighted ? 700 : 500)};
  font-size: 13px;
  color: ${({ contentTextColor }) => contentTextColor};

  ${Media.upToSmall()} {
    margin: 0;
  }

  > span {
    display: block;
    text-align: right;
    word-break: normal;
  }

  i {
    font-style: normal;
    word-break: break-all;
    text-align: right;
  }
`

export const Label = styled.span<{ labelOpacity?: boolean }>`
  align-items: center;
  color: inherit;
  display: flex;
  flex-flow: row;
  flex: 0 1 auto;
  font-weight: 400;
  gap: 4px;
  hyphens: auto;
  line-height: 1.2;
  opacity: ${({ labelOpacity }) => (labelOpacity ? 0.7 : 1)};
  overflow-wrap: normal;
  text-align: left;
  white-space: normal;
  word-break: normal;
  transition:
    color var(${UI.ANIMATION_DURATION}) ease-in-out,
    opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`
