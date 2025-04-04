import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  border-top: 1px solid var(${UI.COLOR_BORDER});
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
`

export const TokenItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  background: none;
  border: 0;
  outline: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  padding: 12px 16px;
  margin: 0;
  opacity: 1;
  transition:
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &.token-item-selected {
    opacity: 0.5;
  }

  ${Media.upToSmall()} {
    font-size: 14px;
    padding: 10px 15px;
  }

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    color: inherit;
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  &.token-item-selected:hover {
    background: none;
  }
`

export const TokenBalance = styled.span`
  flex: 1 0 auto;
  display: flex;
  justify-content: flex-end;

  > span {
    text-align: right;
  }
`
