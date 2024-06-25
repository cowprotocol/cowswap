import { UI } from '@cowprotocol/ui'

import { MenuButton, MenuList } from '@reach/menu-button'
import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

export const SettingsTitle = styled.h3`
  font-weight: 600;
  font-size: 14px;
  color: inherit;
  margin: 0 0 12px 0;
`

export const SettingsContainer = styled.div`
  margin: 12px 0 0;
  padding: 16px;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.boxShadow2};
  border: 1px solid ${({ theme }) => transparentize(theme.white, 0.95)};
  background: var(${UI.COLOR_PAPER});
  color: inherit;
`

export const SettingsBoxWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  justify-content: space-between;
  margin: 0 0 10px;
  color: inherit;

  :last-child {
    margin-bottom: 0;
  }

  opacity: ${({ disabled }) => (disabled ? '0.7' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : '')};
`

export const SettingsBoxTitle = styled.div`
  display: flex;
  align-items: center;
  font-weight: 400;
  color: inherit;
  font-size: 14px;
  opacity: 0.85;
  margin-right: 2rem;
`

export const SettingsButton = styled(MenuButton)`
  display: flex;
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  color: inherit;
  cursor: pointer;
`

export const MenuContent = styled(MenuList)`
  position: relative;
  z-index: 2;
  color: var(${UI.COLOR_TEXT_PAPER});
`
