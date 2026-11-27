import { UI, font } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { tradeRowsWideStyles } from 'modules/trade'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  gap: 8px;
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
  color: var(${UI.COLOR_TEXT});
  ${font('FONT_SMALL_PLUS', 'medium')}
`

export const Value = styled.span`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  color: var(${UI.COLOR_TEXT_SECONDARY});
  ${font('FONT_SMALL_PLUS', 'medium')}
`

export const Details = styled.div<{ $wide?: boolean }>`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  ${({ $wide }) => $wide && tradeRowsWideStyles}
`
