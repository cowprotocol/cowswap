import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TradeWidgetWrapper = styled.div<{ visible$: boolean }>`
  visibility: ${({ visible$ }) => (visible$ ? 'visible' : 'hidden')};
  height: ${({ visible$ }) => (visible$ ? '' : '0px')};
  width: ${({ visible$ }) => (visible$ ? '100%' : '0px')};
  overflow: hidden;
`

export const RescueFundsToggle = styled.button`
  background: var(${UI.COLOR_PAPER});
  border: 0;
  outline: none;
  text-align: right;
  cursor: pointer;
  text-decoration: underline;
  padding: 5px;

  &:hover {
    text-decoration: none;
  }
`
