import { UI } from '@cowprotocol/ui'

import { MenuButton, MenuList } from '@reach/menu-button'
import { transparentize } from 'color2k'
import styled, { css } from 'styled-components/macro'

export const SettingsTitle = styled.h3`
  font-weight: 600;
  font-size: 18px;
  color: inherit;
  margin: 0 auto 21px;
  width: 100%;
  text-align: center;
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

const iconButtonStyles = css<{ active?: boolean; iconSize?: string }>`
  --maxSize: 28px;
  --iconSize: ${({ iconSize }) => iconSize || `var(${UI.ICON_SIZE_NORMAL})`};
  background: ${({ active }) => (active ? `var(${UI.COLOR_PAPER_DARKER})` : 'none')};
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(${UI.COLOR_TEXT});
  opacity: ${({ active }) => (active ? '1' : '0.6')};
  transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;
  border-radius: 8px;
  max-width: var(--maxSize);
  max-height: var(--maxSize);
  width: var(--maxSize);
  height: var(--maxSize);

  &:hover {
    opacity: 1;
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  > svg {
    width: var(--iconSize);
    height: var(--iconSize);
    color: inherit;
    object-fit: contain;
  }
`

export const SettingsButtonIcon = styled.span<{ active?: boolean; iconSize?: string }>`
  ${iconButtonStyles}
  --iconSize: 18px;
  margin: auto;
`

export const MenuContent = styled(MenuList)`
  position: relative;
  z-index: 2;
  color: var(${UI.COLOR_TEXT_PAPER});
`

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 4px;
`

export const UsdButton = styled.button<{ active?: boolean }>`
  ${iconButtonStyles}
  --iconSize: 20px;
`
