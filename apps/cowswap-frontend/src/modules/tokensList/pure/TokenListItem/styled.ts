import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  border-top: 1px solid var(${UI.COLOR_BORDER});
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
`

export const TokenItem = styled.button`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  width: 100%;
  background: none;
  border: 0;
  outline: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  padding: 10px 20px;
  margin-bottom: 10px;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out, color var(${UI.ANIMATION_DURATION}) ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
    padding: 10px 15px;
    justify-content: flex-end;
  `}

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: ${({ disabled }) => !disabled && `var(${UI.COLOR_PAPER_DARKER})`};
    color: inherit;
  }
`

export const TokenBalance = styled.span`
  flex: 1 1 auto;
  display: flex;
  justify-content: flex-end;

  > span {
    text-align: right;
  }
`
