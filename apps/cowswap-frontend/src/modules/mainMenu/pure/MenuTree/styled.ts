import { UI } from '@cowprotocol/common-const'

import styled from 'styled-components/macro'

export const MenuBadge = styled.div`
  display: flex;
  align-items: center;
  padding: 3px 5px;
  margin: 0 0 0 5px;
  background: var(${UI.COLOR_ALERT_BG});
  color: var(${UI.COLOR_ALERT_TEXT});
  border: 0;
  cursor: pointer;
  border-radius: 16px;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  font-weight: 600;
  transition: color 0.1s ease-in-out;
`
