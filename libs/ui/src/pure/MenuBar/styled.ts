import styled from 'styled-components/macro'
import { UI } from '@cowprotocol/ui'

export const MenuBarWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 10px;
  z-index: 10;

  // temporary
  position: sticky;
  top: 0;
`

export const MenuBarInner = styled.div<{ themeMode: string }>`
  --height: 56px;
  --width: 100%;
  --bgColor: rgba(255, 248, 247, 0.6);
  --bgColor: ${({ themeMode }) => (themeMode === 'dark' ? '#333' : 'rgba(255, 248, 247, 0.6)')};
  --borderRadius: 28px;
  --blur: 16px;

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
`

export const NavDaoTriggerElement = styled.div<{ isActive: boolean }>`
  --size: 42px;
  --defaultFill: grey;
  --activeBackground: #555; // Active background color
  --activeFill: #fff; // Active fill color

  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: 16px;
  height: var(--size);
  width: var(--size);
  border-radius: 50%;
  background: ${({ isActive }) => (isActive ? 'var(--activeBackground)' : 'transparent')};
  color: ${({ isActive }) => (isActive ? 'var(--activeFill)' : 'var(--defaultFill)')};
  cursor: pointer;
  transition: background 0.2s, fill 0.2s;

  &:hover {
    background: var(--activeBackground);
    color: ${({ isActive }) => (isActive ? 'var(--activeFill)' : 'var(--defaultFill)')};
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

export const NavItems = styled.ul`
  --marginLeft: 20px;

  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  list-style-type: none;
  margin: 0 auto 0 var(--marginLeft);
  padding: 0;
`

export const DropdownContent = styled.div<{ isOpen: boolean; isThirdLevel?: boolean; alignRight?: boolean }>`
  --dropdownOffset: 12px;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  flex: ${({ isThirdLevel }) => (isThirdLevel ? '1 1 100%;' : 'initial')};
  position: absolute;
  background: rgba(255, 248, 247, 1);
  background: ${({ isThirdLevel }) =>
    isThirdLevel ? 'yellow' : 'rgba(255, 248, 247, 1)'}; // temp if isThirdLevel, use yellow background
  backdrop-filter: blur(15px);
  z-index: 1000;
  top: calc(100% + var(--dropdownOffset));
  right: ${({ alignRight }) => (alignRight ? 0 : 'initial')};
  left: ${({ alignRight }) => (alignRight ? 'initial' : 0)};
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: ${({ isThirdLevel }) => (isThirdLevel ? '8px' : '4px')};
  position: absolute;
  position: ${({ isThirdLevel }) => (isThirdLevel ? 'relative' : 'absolute')};
  min-width: ${({ isThirdLevel }) => (isThirdLevel ? '200px' : '300px')};
  width: ${({ isThirdLevel }) => (isThirdLevel ? '100%' : 'max-content')};
  max-width: ${({ isThirdLevel }) => (isThirdLevel ? '400px' : '530px')};
  height: auto;
  border-radius: 28px;

  &::before {
    content: '';
    position: absolute;
    top: calc(-2 * var(--dropdownOffset));
    left: 0;
    border: var(--dropdownOffset) solid transparent;
    width: 100%;
  }
`

export const StyledDropdownContentItem = styled.a`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  padding: 8px 12px;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.2s ease-in-out;
  border-radius: 24px;
  min-height: 56px;
  gap: 10px;

  &:hover {
    background-color: #e0e0e0;
  }

  > svg {
    display: block;
    --size: 20px;
    height: var(--size);
    width: auto;
    margin: 0 5px 0 auto;
    object-fit: contain;
    color: inherit;
  }

  > svg path {
    fill: transparent;
  }

  &:hover > svg {
    fill: currentColor;
  }

  &:hover > svg path {
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
  gap: 5px;
`

export const DropdownContentItemTitle = styled.span`
  font-weight: bold;
  font-size: 18px;
`

export const DropdownContentItemDescription = styled.span`
  font-size: 14px;
  color: #666;
`

export const DropdownContentItemButton = styled.button`
  ${StyledDropdownContentItem};
  background: red;
  width: 100%;
  border: 0;
  border-radius: 24px;
`

export const DropdownMenu = styled.div`
  position: relative;
  display: inline-block;
`

export const RootNavItem = styled.a<{ isOpen?: boolean }>`
  color: black;
  font-size: 16px;
  padding: 12px 16px;
  border-radius: 32px;
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

  &:hover {
    background-color: #9c8d8d;
  }

  > svg {
    --size: 12px;
    height: var(--size);
    width: var(--size);
    object-fit: contain;
    margin-left: auto;
    fill: currentColor;
    transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
    transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;
  }
`

export const RightAligned = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  margin: 0 0 0 auto;
`

export const GlobalSettingsWrapper = styled.div`
  position: relative;
`

export const GlobalSettingsButton = styled.button`
  --size: 42px;
  --defaultFill: grey;
  --activeBackground: #555; // Active background color
  --activeFill: #fff; // Active fill color

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

  > svg {
    --size: 65%;
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

    > svg {
      color: var(--activeFill);
    }
  }
`
