import { UI } from '@cowprotocol/ui'

import { MenuButton, MenuList } from '@reach/menu-button'
import styled from 'styled-components/macro'

import { blankButtonMixin } from '../commonElements'

export const Wrapper = styled.div<{ $enabled: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 20px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid ${({ $enabled }) => ($enabled ? `transparent` : `var(${UI.COLOR_BORDER})`)};
  background-color: ${({ $enabled }) => ($enabled ? `var(${UI.COLOR_PAPER_DARKER})` : 'transparent')};
`

export const SettingsButton = styled(MenuButton)`
  ${blankButtonMixin};
  color: inherit;

  > svg {
    color: inherit;
    stroke: currentColor;
  }

  > svg > path {
    stroke: currentColor;
  }
`

export const SettingsContainer = styled(MenuList)`
  position: relative;
  z-index: 12;
  background: var(${UI.COLOR_PAPER});
  padding: 10px;
  border-radius: 10px;
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
`

export const SettingsAction = styled.div`
  color: var(${UI.COLOR_LINK});
  cursor: pointer;
  padding: 5px;
  box-sizing: content-box;

  > a {
    text-decoration: none;
    color: inherit;
  }

  &:hover {
    text-decoration: underline;
  }
`

export const ListVersion = styled.div`
  color: var(${UI.COLOR_DISABLED_TEXT});
  border-bottom: 1px solid var(${UI.COLOR_PAPER_DARKER});
  padding: 0 5px 10px 5px;
`
