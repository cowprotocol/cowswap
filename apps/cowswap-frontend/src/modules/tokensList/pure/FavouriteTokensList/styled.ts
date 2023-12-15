import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Header = styled.div`
  display: flex;
  gap: 5px;
  flex-direction: row;
  align-items: center;

  > h4 {
    font-size: 14px;
    font-weight: 500;
    margin: 0;
  }
`

export const List = styled.div`
  display: block;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    white-space: nowrap;
    overflow-x: scroll;
    ${theme.colorScrollbar};
  `}
`

export const TokensItem = styled.button`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  justify-content: center;
  margin: 5px 10px 5px 0;
  background: none;
  outline: none;
  padding: 6px 10px;
  border-radius: 10px;
  color: inherit;
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  font-weight: 500;
  font-size: 16px;
  cursor: ${({ disabled }) => (disabled ? '' : 'pointer')};
  background: ${({ disabled }) => disabled && `var(${UI.COLOR_PAPER_DARKER})`};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  transition: border var(${UI.ANIMATION_DURATION}) ease-in-out;

  :hover {
    border: 1px solid ${({ disabled }) => (disabled ? `var(${UI.COLOR_PAPER_DARKER})` : `var(${UI.COLOR_PRIMARY})`)};
  }
`
