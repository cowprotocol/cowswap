import { UI } from '@cowprotocol/ui'

import { MenuButton, MenuList } from '@reach/menu-button'
import { transparentize } from 'color2k'
import { Settings as SettingsIconRaw } from 'react-feather'
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
  color: inherit;
  color: var(${UI.COLOR_TEXT_PAPER});
`

export const ExpertModeIndicator = styled.div`
  display: inline-block;
  position: relative;
  width: 12px;
  height: 24px;
  font-size: 20px;
  user-select: none;
  margin-right: 17px;
  animation: expertModeOn 3s normal forwards ease-in-out;
  color: inherit;

  > span:first-child {
    position: absolute;
    top: -10px;
    z-index: 1;
  }

  > span:last-child {
    position: absolute;
    top: 2px;
  }

  @keyframes expertModeOn {
    0% {
      filter: none;
    }
    15% {
      filter: sepia(1);
    }
    30% {
      filter: sepia(0);
    }
    45% {
      filter: sepia(1);
    }
    60% {
      filter: sepia(0);
    }
    75% {
      filter: sepia(1);
    }
    100% {
      filter: sepia(0);
    }
  }
`

export const SettingsIcon = styled(SettingsIconRaw)`
  height: 20px;
  width: 20px;
  color: inherit;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }

  > path,
  > circle {
    transition: stroke var(${UI.ANIMATION_DURATION}) ease-in-out;
    stroke: currentColor;
  }
`
