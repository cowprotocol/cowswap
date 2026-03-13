import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const DropdownButton = styled.button`
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 12px;
  padding: 10px 34px 10px 12px;
  width: 180px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  transition: all 0.2s ease-in-out;

  &::after {
    content: '▼';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    transition: transform 0.2s ease-in-out;
    color: var(${UI.COLOR_PRIMARY_OPACITY_50});
  }

  &:hover {
    border-color: var(${UI.COLOR_PRIMARY_OPACITY_25});
    background: var(${UI.COLOR_PRIMARY_OPACITY_10});
  }

  &:focus {
    outline: none;
  }
`

export const DropdownList = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(${UI.COLOR_PAPER});
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 12px;
  padding: 6px;
  width: 180px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`

export const DropdownItem = styled.div`
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease-in-out;
  color: inherit;

  &:hover {
    background: var(${UI.COLOR_PRIMARY_OPACITY_10});
    transform: translateX(2px);
  }

  &:active {
    transform: translateX(2px) scale(0.98);
  }
`

export const DropdownContainer = styled.div`
  position: relative;
  user-select: none;
`

export const SettingsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  font-weight: 400;
  color: inherit;
  font-size: 14px;
`

export const SettingsLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`
