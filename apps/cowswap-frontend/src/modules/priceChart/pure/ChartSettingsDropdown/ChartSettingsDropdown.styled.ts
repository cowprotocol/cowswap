import { UI } from '@cowprotocol/ui'

import { MenuItems } from '@reach/menu-button'
import styled from 'styled-components/macro'

export const SettingsList = styled(MenuItems)`
  position: relative;
  z-index: 100;
  width: min(360px, calc(100vw - 32px));
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 12px;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  box-shadow: var(${UI.BOX_SHADOW_2});
`
