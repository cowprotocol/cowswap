import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px 0;
  gap: 10px;
`

export const NoFunds = styled.span`
  color: var(${UI.COLOR_ALERT_TEXT});
  background: var(${UI.COLOR_ALERT_BG});
  padding: 10px;
  border-radius: 16px;
`
