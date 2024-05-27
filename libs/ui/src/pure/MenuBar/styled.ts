import { CowSwapTheme } from '@cowprotocol/widget-lib'

import styled, { css } from 'styled-components/macro'

import { Color } from '../../consts'

export const MenuBarWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 10px;
  z-index: 10;
  position: sticky;
  top: 0;
`

export const MenuBarInner = styled.div<{ theme: CowSwapTheme }>`
  --height: 56px;
  --width: 100%;
  --bgColor: ${({ theme }) => (theme.mode === 'dark' ? Color.neutral10 : 'rgba(255, 248, 247, 0.6)')};
  --color: ${({ theme }) => (theme.mode === 'dark' ? Color.neutral98 : Color.neutral0)};
  --borderRadius: 28px;
  --blur: 16px;

  // Elements
  --defaultFill: ${({ theme }) => (theme.mode === 'dark' ? Color.neutral60 : Color.neutral50)};
  --activeBackground: ${({ theme }) => (theme.mode === 'dark' ? Color.neutral30 : Color.neutral50)};
  --activeFill: ${({ theme }) => (theme.mode === 'dark' ? Color.neutral100 : Color.neutral0)};

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 4px;
  gap: 8px;
  height: var(--height);
  width: var(--width);
  background: var(--bgColor);
  backdrop-filter: blur(var(--blur));
  border-radius: var(--borderRadius);
  color: var(--color);
`

export const NavDaoTriggerElement = styled.div<{ isActive: boolean }>`
  --size: 42px;

  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: 16px;
  height: var(--size);
  width: var(--size);
  min-width: var(--size);
  min-height: var(--size);
  border-radius: 50%;
  background: ${({ isActive }) => (isActive ? 'var(--activeBackground)' : 'transparent')};
  color: ${({ isActive }) => (isActive ? 'var(--activeFill)' : 'var(--defaultFill)')};
  cursor: pointer;
  transition: background 0.2s, fill 0.2s;

  &:hover {
    background: var(--activeBackground);
    color: var(--activeFill);
  }

  > svg {
    --size: 50%;
    height: var(--size);
    width: var(--size);
    object-fit: contain;
    color: currentColor;
    margin: auto;
  }

  > svg path {
    fill: currentColor;
  }
`

export const MobileMenuTrigger = styled.div<{ theme: CowSwapTheme }>`
  --size: 42px;

  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: 16px;
  height: var(--size);
  width: var(--size);
  min-width: var(--size);
  min-height: var(--size);
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background 0.2s, fill 0.2s;

  &:hover {
    background: var(--activeBackground);
  }

  > svg {
    --size: 50%;
    height: var(--size);
    width: var(--size);
    object-fit: contain;
    color: currentColor;
    margin: auto;
  }

  > svg path {
    fill: currentColor;
  }
`

export const NavItems = styled.ul<{ mobileMode?: boolean; theme: CowSwapTheme }>`
  --marginLeft: 20px;
  --borderRadius: 28px;
  --blur: 16px;

  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: stretch;
  gap: 4px;
  list-style-type: none;
  margin: 0 auto 0 var(--marginLeft);
  padding: 0;

  ${({ mobileMode }) =>
    mobileMode &&
    css`
      flex-flow: column wrap;
      align-items: flex-start;
      margin: 16px auto;
      width: calc(100% - 20px);
      position: absolute;
      top: 56px;
      left: 10px;
      z-index: 1000;
      box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
      /* padding: 16px; */
      border-radius: 28px;
      background: var(--bgColor);
      backdrop-filter: blur(var(--blur));
      border-radius: var(--borderRadius);

      padding: 16px 16px 100px;
      overflow-y: scroll;
      min-height: 100vh;
      height: 100vh;

      > div {
        width: 100%;
        position: relative;
      }
    `}
`

interface DropdownContentProps {
  isOpen: boolean
  isThirdLevel?: boolean
  alignRight?: boolean
  mobileMode?: boolean
  isNavItemDropdown?: boolean
}

export const DropdownContent = styled.div<DropdownContentProps>`
  --dropdownOffset: 12px;

  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  flex: ${({ isThirdLevel }) => (isThirdLevel ? '1 1 100%;' : 'initial')};
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  background: ${({ isThirdLevel }) => (isThirdLevel ? 'transparent' : 'var(--bgColor)')};
  backdrop-filter: blur(15px);
  z-index: 1000;
  padding: ${({ isThirdLevel }) => (isThirdLevel ? '8px' : '4px')};
  min-width: ${({ isThirdLevel }) => (isThirdLevel ? '200px' : '300px')};
  width: ${({ isThirdLevel }) => (isThirdLevel ? '100%' : 'max-content')};
  max-width: ${({ isThirdLevel }) => (isThirdLevel ? '100%' : '530px')};
  height: auto;
  border-radius: 28px;
  position: ${({ isThirdLevel }) => (isThirdLevel ? 'relative' : 'absolute')};
  top: ${({ isThirdLevel }) => (isThirdLevel ? 'initial' : 'calc(100% + var(--dropdownOffset))')};
  right: ${({ alignRight }) => (alignRight ? 0 : 'initial')};
  left: ${({ alignRight }) => (alignRight ? 'initial' : 0)};
  cursor: pointer;

  ${({ mobileMode }) =>
    mobileMode &&
    css`
      max-width: 100%;
      width: 100%;
      position: fixed;
    `}

  ${({ mobileMode, isNavItemDropdown }) =>
    mobileMode &&
    isNavItemDropdown &&
    css`
      position: relative;
      top: initial;
      right: initial;
      left: initial;
      background: transparent;
      backdrop-filter: none;
    `}

  &::before {
    content: '';
    position: absolute;
    top: calc(-2 * var(--dropdownOffset));
    left: 0;
    border: var(--dropdownOffset) solid transparent;
    width: 100%;
  }
`

export const StyledDropdownContentItem = styled.a<{ isOpen?: boolean; isThirdLevel?: boolean }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  padding: ${({ isThirdLevel }) => (isThirdLevel ? '16px 16px' : '8px 12px')};
  text-decoration: none;
  color: inherit;
  transition: background 0.2s ease-in-out;
  border-radius: 24px;
  min-height: 56px;
  gap: 10px;
  position: relative;
  width: 100%;

  &:hover {
    background: ${({ isThirdLevel }) => (isThirdLevel ? 'var(--bgColor)' : 'var(--activeBackground)')};

    > svg.arrow-icon-right {
      opacity: 1;
    }
  }

  > svg {
    display: block;
    --size: 20px;
    height: var(--size);
    width: auto;
    margin: 0 5px 0 auto;
    object-fit: contain;
    color: inherit;
    transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
    transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;

    &.arrow-icon-right {
      opacity: 0;
      transform: none;
    }
  }

  > svg path {
    fill: currentColor;
  }
`

export const DropdownContentItemIcon = styled.img`
  width: 56px;
  height: 100%;
  object-fit: contain;
`

export const DropdownContentItemImage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: auto;
  height: 56px;
`

export const DropdownContentItemText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const DropdownContentItemTitle = styled.span`
  font-weight: bold;
  font-size: 18px;
  line-height: 1.2;
`

export const DropdownContentItemDescription = styled.span`
  font-size: 14px;
  color: var(--defaultFill);
  line-height: 1.2;
`

export const DropdownContentItemButton = styled.button`
  ${StyledDropdownContentItem};
  background: red;
  width: 100%;
  border: 0;
  border-radius: 24px;
`

export const DropdownMenu = styled.div<{ mobileMode?: boolean }>`
  position: relative;
  display: inline-block;
  border-radius: inherit;
  border-radius: var(--borderRadius);
  color: inherit;

  &:hover {
    background: var(--activeBackground);
  }

  ${({ mobileMode }) =>
    mobileMode &&
    css`
      width: 100%;
    `}
`

export const RootNavItem = styled.a<{ isOpen?: boolean; mobileMode?: boolean }>`
  color: inherit;
  font-size: 16px;
  padding: 12px 16px;
  border-radius: var(--borderRadius);
  border: none;
  text-decoration: none;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  background: transparent;
  transition: background 0.2s ease-in-out;
  cursor: pointer;
  gap: 5px;
  color: inherit;

  &:hover {
    background: var(--activeBackground);
  }

  ${({ mobileMode }) =>
    mobileMode &&
    css`
      width: 100%;
      align-items: center;
      justify-content: left;
    `}

  > svg {
    --size: 12px;
    height: var(--size);
    width: var(--size);
    object-fit: contain;
    margin-left: auto;
    fill: currentColor;
    transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
    transition: transform 0.2s ease-in-out;
  }
`

export const RightAligned = styled.div<{ mobileMode?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  margin: 0 0 0 auto;

  ${({ mobileMode }) =>
    mobileMode &&
    css`
      gap: 10px;
    `}
`

export const GlobalSettingsWrapper = styled.div`
  position: relative;
`

export const GlobalSettingsButton = styled.button`
  --size: 42px;

  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: 16px;
  height: var(--size);
  width: var(--size);
  border-radius: 50%;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s, fill 0.2s;
  color: inherit;

  > svg {
    --size: 75%;
    height: var(--size);
    width: var(--size);
    color: currentColor;
    object-fit: contain;
    margin: auto;
  }

  > svg path {
    stroke: currentColor;
  }

  &:hover {
    background: var(--activeBackground);
    color: var(--activeFill);

    > svg {
      color: var(--activeFill);
    }
  }
`
