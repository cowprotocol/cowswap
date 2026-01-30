import { Menu, MenuButton, MenuItems, MenuItem } from '@reach/menu-button'
import styled, { css } from 'styled-components/macro'

import { UI } from '../../enum'

export const ContextMenu = styled(Menu)``

export const ContextMenuButton = styled(MenuButton).attrs({ type: 'button' })`
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  cursor: pointer;
  height: 16px;
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    color 0.2s ease,
    background 0.2s ease;

  &:hover {
    color: var(${UI.COLOR_TEXT});
    background: var(${UI.COLOR_TEXT_OPACITY_10});
    border-radius: 10px;
  }

  &:active,
  &[data-reach-menu-button][data-state='open'] {
    color: var(${UI.COLOR_TEXT});
    background: var(${UI.COLOR_TEXT_OPACITY_10});
    border-radius: 10px;
    transform: none !important;
  }
`

export const ContextMenuTooltipButton = styled.div<{ disableHoverBackground?: boolean }>`
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  cursor: pointer;
  height: 16px;
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    color 0.2s ease,
    background 0.2s ease;

  > div {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    color: var(${UI.COLOR_TEXT});
    ${({ disableHoverBackground }) =>
      !disableHoverBackground &&
      `
      background: var(${UI.COLOR_TEXT_OPACITY_10});
      border-radius: 10px;
    `}
  }

  &:active,
  &:focus {
    color: var(${UI.COLOR_TEXT});
    outline: none;
    ${({ disableHoverBackground }) =>
      !disableHoverBackground &&
      `
      background: var(${UI.COLOR_TEXT_OPACITY_10});
      border-radius: 10px;
    `}
  }
`

export const ContextMenuItems = styled(MenuItems)`
  background: var(${UI.COLOR_PAPER_DARKER});
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  border-radius: 12px;
  box-shadow: var(${UI.BOX_SHADOW});
  overflow: hidden;
  position: absolute;
  outline: none;
  min-width: 180px;
  padding: 10px;
  z-index: 100;
  right: 0;
  top: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT});
`

const dangerVariantStyles = css`
  color: var(${UI.COLOR_DANGER});

  &:hover,
  &:active,
  &:focus {
    background: var(${UI.COLOR_TEXT_OPACITY_10});
    color: var(${UI.COLOR_DANGER});
  }
`

const BaseMenuItemStyles = css`
  padding: 12px;
  border-radius: 6px;
  margin: 0;
  cursor: pointer;
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT});
  background: transparent;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
  width: 100%;
  text-align: left;

  &:hover,
  &:active,
  &:focus {
    background: var(${UI.COLOR_TEXT_OPACITY_10});
    outline: none;
  }
`

export const ContextMenuItem = styled(MenuItem)<{ variant?: 'danger' }>`
  ${BaseMenuItemStyles}
  border: none;

  ${({ variant }) => variant === 'danger' && dangerVariantStyles}
`

export const ContextMenuContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  min-width: 155px;
  padding: 0px;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT});
`

export const ContextMenuItemButton = styled.button<{ variant?: 'danger' }>`
  ${BaseMenuItemStyles}
  border: none;

  ${({ variant }) => variant === 'danger' && dangerVariantStyles}
`

export const ContextMenuItemLink = styled.a<{ variant?: 'danger' }>`
  ${BaseMenuItemStyles}
  border: none;
  text-decoration: none;

  ${({ variant }) => variant === 'danger' && dangerVariantStyles}
`

export const ContextMenuItemText = styled.span`
  ${BaseMenuItemStyles}
  cursor: default;

  &:hover,
  &:active,
  &:focus {
    background: transparent;
  }
`
