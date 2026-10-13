import { Media, UI, font } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  padding: 6px;
  gap: 8px;

  ${Media.upToSmall()} {
    padding: 2px;
  }
`

export const Header = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(${UI.COLOR_TEXT});
  ${font('FONT_SMALL_PLUS', 'medium')}
  outline: none;
`

export const Label = styled.span`
  font-weight: var(${UI.FONT_WEIGHT_NORMAL});
  color: var(${UI.COLOR_TEXT});
`

export const Value = styled.span`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  color: var(${UI.COLOR_TEXT});
`

export const Details = styled.div<{ $isVisible: boolean }>`
  display: ${({ $isVisible }) => ($isVisible ? 'flex' : 'none')};
  width: 100%;
  flex-flow: column wrap;
`
