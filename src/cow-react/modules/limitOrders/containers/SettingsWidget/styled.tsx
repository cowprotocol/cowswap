import styled from 'styled-components/macro'
import { Settings as SettingsIconRaw } from 'react-feather'
import { transparentize } from 'polished'
import { MenuButton, MenuList } from '@reach/menu-button'

export const SettingsButton = styled(MenuButton)`
  display: flex;
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
`

export const MenuContent = styled(MenuList)`
  position: relative;
  z-index: 2;
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

  > path,
  > circle {
    transition: stroke 0.3s ease-in-out;
    stroke: ${({ theme }) => transparentize(0.3, theme.text1)};
  }

  &:hover > path,
  &:hover > circle {
    stroke: ${({ theme }) => theme.text1};
  }
`
