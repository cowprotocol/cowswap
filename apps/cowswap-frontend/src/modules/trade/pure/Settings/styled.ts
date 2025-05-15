import { UI } from '@cowprotocol/ui'

import { MenuButton, MenuList } from '@reach/menu-button'
import styled, { css } from 'styled-components/macro'

export const SettingsContainer = styled.div`
  --padding: 10px;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: var(--padding);
  border-radius: 12px;
  box-shadow: var(${UI.BOX_SHADOW_2});
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  background: var(${UI.COLOR_PAPER});
  color: inherit;
  gap: 10px;
  position: absolute;
  right: 9px;
  margin: auto;
  top: 48px;
  z-index: 100;
  min-width: 330px;
  max-width: calc(100% - var(--padding) * 2);
`

export const SettingsTitle = styled.h3`
  font-weight: 600;
  font-size: 15px;
  color: inherit;
  width: 100%;
  text-align: left;
  margin: 0;
`

export const SettingsBoxWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  justify-content: space-between;
  margin: 0;
  gap: 10px;
  color: inherit;
  opacity: ${({ disabled }) => (disabled ? '0.7' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : '')};

  :last-child {
    margin-bottom: 0;
  }
`

export const SettingsBoxTitle = styled.div`
  display: flex;
  align-items: center;
  font-weight: 400;
  color: inherit;
  font-size: 14px;
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
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;
  border-radius: 8px;
  max-width: var(--maxSize);
  max-height: var(--maxSize);
  width: var(--maxSize);
  height: var(--maxSize);

  &:hover {
    color: var(${UI.COLOR_TEXT});
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

  [data-reach-menu-popover] {
    position: absolute;
    width: 100%;
    left: 0;
    top: 0;
  }
`

export const UsdButton = styled.button<{ active?: boolean }>`
  ${iconButtonStyles}
  --iconSize: 20px;
`
