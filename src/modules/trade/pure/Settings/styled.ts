import { MenuButton, MenuList } from '@reach/menu-button'
import { transparentize } from 'polished'
import { Settings as SettingsIconRaw } from 'react-feather'
import styled from 'styled-components/macro'

export const SettingsTitle = styled.h3`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  margin: 0 0 12px 0;
`

export const SettingsContainer = styled.div`
  margin: 12px 0 0;
  padding: 16px;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.boxShadow2};
  border: 1px solid ${({ theme }) => transparentize(0.95, theme.white)};
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1};
`

export const SettingsBoxWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

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
  color: ${({ theme }) => theme.text1};
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
