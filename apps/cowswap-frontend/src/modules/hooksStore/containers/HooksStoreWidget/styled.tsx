import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TradeWidgetWrapper = styled.div<{ visible$: boolean }>`
  visibility: ${({ visible$ }) => (visible$ ? 'visible' : 'hidden')};
  height: ${({ visible$ }) => (visible$ ? '' : '0px')};
  width: ${({ visible$ }) => (visible$ ? '100%' : '0px')};
  overflow: hidden;
`

export const HooksTopActions = styled.div`
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
  border-radius: 12px;
  font-size: 13px;
  background: var(${UI.COLOR_PAPER_DARKER});
`

export const RecoverFundsToggle = styled.button`
  background: transparent;
  font-size: inherit;
  color: inherit;
  border: 0;
  outline: none;
  transition: all 0.2s ease-in-out;
  border-radius: 9px;
  cursor: pointer;
  padding: 6px;

  &:hover {
    text-decoration: none;
    background: var(${UI.COLOR_PAPER});
  }
`
