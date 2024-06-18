import { CowSwapTheme } from '@cowprotocol/widget-lib'
import styled, { css } from 'styled-components/macro'
import { Color, Font } from '../../consts'
import { ProductLogoWrapper } from '../ProductLogo'

export const MenuBarWrapper = styled.div<{
  theme: CowSwapTheme
  bgColorLight?: string
  bgColorDark?: string
  colorLight?: string
  colorDark?: string
  bgDropdownColorLight?: string
  bgDropdownColorDark?: string
  defaultFillLight?: string
  defaultFillDark?: string
  activeBackgroundLight?: string
  activeBackgroundDark?: string
  activeFillLight?: string
  activeFillDark?: string
  hoverBackgroundLight?: string
  hoverBackgroundDark?: string
  padding?: string
  mobileMode?: boolean
}>`
  --height: 56px;
  --width: 100%;
  --bgColor: ${({ theme, bgColorLight, bgColorDark }) =>
    theme.mode === 'dark' ? bgColorDark || Color.neutral10 : bgColorLight || 'rgb(255 248 247 / 40%)'};
  --bgDropdownColor: ${({ theme, bgDropdownColorLight, bgDropdownColorDark }) =>
    theme.mode === 'dark' ? bgDropdownColorDark || Color.neutral10 : bgDropdownColorLight || Color.neutral100};
  --color: ${({ theme, colorLight, colorDark }) =>
    theme.mode === 'dark' ? colorDark || Color.neutral98 : colorLight || Color.neutral0};
  --borderRadius: 28px;
  --blur: 16px;

  // Elements
  --defaultFill: ${({ theme, defaultFillLight, defaultFillDark }) =>
    theme.mode === 'dark' ? defaultFillDark || Color.neutral60 : defaultFillLight || 'rgb(0 0 0 / 50%)'};
  --activeBackground: ${({ theme, activeBackgroundLight, activeBackgroundDark }) =>
    theme.mode === 'dark' ? activeBackgroundDark || Color.neutral30 : activeBackgroundLight || Color.neutral100};
  --activeFill: ${({ theme, activeFillLight, activeFillDark }) =>
    theme.mode === 'dark' ? activeFillDark || Color.neutral100 : activeFillLight || Color.neutral0};
  --hoverBackground: ${({ theme, hoverBackgroundLight, hoverBackgroundDark }) =>
    theme.mode === 'dark' ? hoverBackgroundDark || Color.neutral20 : hoverBackgroundLight || Color.neutral90};

  display: flex;
  width: 100%;
  padding: ${({ padding }) => padding || '10px'};
  z-index: 10;
  position: sticky;
  top: 0;
  color: var(--color);

  ${({ mobileMode }) =>
    mobileMode &&
    css`
      padding: 10px;
    `}
`

export const MenuBarInner = styled.div<{ theme: CowSwapTheme }>`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 6px;
  gap: 6px;
  height: var(--height);
  width: var(--width);
  background: var(--bgColor);
  backdrop-filter: blur(var(--blur));
  border-radius: var(--borderRadius);
  color: var(--color);
`

export const NavDaoTriggerElement = styled.div<{ isActive: boolean; mobileMode?: boolean; isOpen?: boolean }>`
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

export const MobileMenuTrigger = styled.div<{ theme: CowSwapTheme; mobileMode?: boolean }>`
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
  color: var(--defaultFill);
  cursor: pointer;
  transition: background 0.2s, fill 0.2s;

  ${({ mobileMode }) =>
    mobileMode &&
    css`
      --size: 33px;
    `}

  &:hover {
    background: var(--activeBackground);
    color: var(--activeFill);
  }

  > svg {
    --size: 21px;
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
  width: auto;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: stretch;
  gap: 4px;
  list-style-type: none;
  margin: 0 0 0 var(--marginLeft);
  padding: 0;
  color: inherit;

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
      border-radius: 28px;
      background: var(--activeBackground);
      backdrop-filter: blur(var(--blur));
      border-radius: var(--borderRadius);
      padding: 16px 16px 200px;
      overflow-y: scroll;
      min-height: 100vh;
      height: 100vh;
      // smooth ios scroll
      -webkit-overflow-scrolling: touch;

      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: ${Color.neutral90};
        border-radius: 10px;
      }

      ::-webkit-scrollbar-thumb {
        background: ${Color.neutral70};
        border-radius: 10px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: ${Color.neutral50};
      }

      > div {
        width: 100%;
        position: relative;
        color: inherit;
      }
    `}
`

interface DropdownContentProps {
  isOpen: boolean
  isThirdLevel?: boolean
  mobileMode?: boolean
  isNavItemDropdown?: boolean
  alignRight?: boolean
}

export const DropdownContentWrapper = styled.div<DropdownContentProps>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  flex: ${({ isThirdLevel }) => (isThirdLevel ? '1 1 100%;' : 'initial')};
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  background: ${({ isThirdLevel }) => (isThirdLevel ? 'transparent' : 'var(--activeBackground)')};
  backdrop-filter: blur(var(--blur));
  z-index: 1000;
  padding: ${({ isThirdLevel }) => (isThirdLevel ? '6px' : '6px')};
  /* min-width: ${({ isThirdLevel }) => (isThirdLevel ? '200px' : '270px')}; */
  width: ${({ isThirdLevel }) => (isThirdLevel ? '100%' : '320px')};
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
      top: 56px;
      height: calc(100vh - 56px);
      overflow-y: auto;
      padding-bottom: 100px;
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
  background: ${({ isThirdLevel }) => (isThirdLevel ? 'transparent' : 'var(--bgDropdownColor)')};
  backdrop-filter: blur(var(--blur));
  z-index: 1000;
  padding: ${({ isThirdLevel }) => (isThirdLevel ? '6px' : '6px')};
  width: ${({ isThirdLevel }) => (isThirdLevel ? '100%' : '320px')};
  height: auto;
  border-radius: 28px;
  position: ${({ isThirdLevel }) => (isThirdLevel ? 'relative' : 'absolute')};
  top: ${({ isThirdLevel }) => (isThirdLevel ? 'initial' : 'calc(100% + var(--dropdownOffset))')};
  right: ${({ alignRight }) => (alignRight ? 0 : 'initial')};
  left: ${({ alignRight }) => (alignRight ? 'initial' : 0)};
  cursor: pointer;
  border: 1px solid var(--hoverBackground);

  ${({ mobileMode }) =>
    mobileMode &&
    css`
      max-width: 100%;
      width: 100%;
      position: fixed;
      border: 0;
    `}

  ${({ mobileMode, isNavItemDropdown }) =>
    mobileMode &&
    isNavItemDropdown &&
    css`
      position: relative;
      top: initial;
      right: initial;
      left: initial;
      backdrop-filter: none;
      padding: 6px;
      margin: 0 0 16px;
      background: var(--hoverBackground);
      border-radius: 12px;
    `}
  &::before {
    content: '';
    position: absolute;
    top: calc(-2 * var(--dropdownOffset));
    left: 0;
    border: var(--dropdownOffset) solid transparent;
    width: 100%;

    ${({ mobileMode }) =>
      mobileMode &&
      css`
        content: none;
      `}
  }
`

export const MobileDropdownContainer = styled.div<{ mobileMode: boolean }>`
  ${({ mobileMode }) =>
    mobileMode &&
    css`
      flex-flow: column wrap;
      align-items: flex-start;
      margin: 6px auto;
      width: 100%;
      position: absolute;
      top: 56px;
      left: 0;
      z-index: 1000;
      box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
      border-radius: 28px;
      background: var(--activeBackground);
      border-radius: var(--borderRadius);
      padding: 10px 10px 100px;
      overflow-y: auto;
      min-height: 100vh;
      height: 100vh;
      box-sizing: border-box;
      scrollbar-width: thin;
      scrollbar-color: var(--scrollbarColor) var(--scrollbarBackground);

      > div {
        width: 100%;
        position: relative;
        left: initial;
        top: initial;
        right: initial;
        padding: 0;
        margin: 0;
        border-radius: 28px;
      }

      /* For WebKit-based browsers (Chrome, Safari) */

      &::-webkit-scrollbar {
        width: 10px;
      }

      &::-webkit-scrollbar-track {
        background: var(--scrollbarBackground);
        border-radius: 28px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: var(--scrollbarColor);
        border-radius: 10px;
        border: 2px solid var(--scrollbarBackground);
      }
    `}
`

export const StyledDropdownContentItem = styled.a<{
  isOpen?: boolean
  isThirdLevel?: boolean
  bgColor?: string
  color?: string
  hoverBgColor?: string
  hoverColor?: string
  mobileMode?: boolean
}>`
  display: flex;
  flex-flow: row;
  align-items: center;
  padding: ${({ isThirdLevel }) => (isThirdLevel ? '16px' : '8px 12px')};
  text-decoration: none;
  color: inherit;
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out;
  border-radius: 24px;
  min-height: 56px;
  gap: 10px;
  position: relative;
  width: 100%;

  ${({ mobileMode }) =>
    mobileMode &&
    css`
      padding: 8px;
    `}

  &.hasDivider {
    margin: 0 0 12px;

    &::after {
      content: '';
      position: absolute;
      top: 100%;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      margin: 0 auto;
      width: 90%;
      height: 1px;
      background: var(--defaultFill);
      opacity: 0.25;
    }
  }

  &:hover {
    background: ${({ hoverBgColor }) => hoverBgColor || 'var(--hoverBackground)'};
    color: ${({ hoverColor }) => hoverColor || 'inherit'};

    ${ProductLogoWrapper} {
      color: ${({ hoverColor }) => hoverColor || 'inherit'};
    }

    > svg.arrow-icon-right {
      opacity: 1;

      &.external {
        transform: rotate(-45deg);
      }
    }
  }

  > svg {
    --size: 20px;
    display: block;
    height: var(--size);
    width: var(--size);
    min-width: var(--size);
    min-height: var(--size);
    margin: 0 5px 0 auto;
    object-fit: contain;
    color: inherit;
    transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
    transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;

    &.arrow-icon-right {
      opacity: 0;
      transform: none;
    }

    &.arrow-icon-right.external {
      opacity: 1;
      transform: rotate(-45deg);
    }
  }

  > svg path {
    fill: currentColor;
  }
`

export const DropdownContentItemIcon = styled.img`
  width: 56px;
  height: 56px;
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
  flex-flow: column wrap;
  gap: 4px;
  white-space: nowrap;
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
  white-space: pre-wrap;
`

export const DropdownContentItemButton = styled(StyledDropdownContentItem)<{
  bgColor?: string
  color?: string
  hoverBgColor?: string
  hoverColor?: string
  minHeight?: string
  mobileMode?: boolean
}>`
  background: ${({ bgColor }) => bgColor || Color.neutral100};
  color: ${({ color }) => color || Color.neutral10};
  width: 100%;
  border: 0;
  border-radius: 24px;

  &:hover {
    background: ${({ hoverBgColor }) => hoverBgColor || Color.neutral90};

    &:hover {
      background: ${({ hoverBgColor }) => hoverBgColor || Color.neutral100};
      color: ${({ hoverColor }) => hoverColor || Color.neutral10};
    }
  }

  > svg.arrow-icon-right {
    &.external {
      transform: rotate(-45deg);
    }
  }
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

    > svg {
      color: inherit;
    }
  }

  ${({ mobileMode }) =>
    mobileMode &&
    css`
      width: 100%;
      align-items: center;
      justify-content: left;
      font-size: 21px;
      font-weight: ${Font.weight.semibold};
      padding: 12px 16px 12px 6px;
    `}
  > svg {
    height: 8px;
    width: 13px;
    object-fit: contain;
    margin: 3px auto 0;
    color: var(--defaultFill);
    transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
    transition: transform 0.2s ease-in-out;

    ${({ mobileMode }) =>
      mobileMode &&
      css`
        margin: 3px 0 0 auto;
        height: 15px;
        width: 24px;
      `}
  }
`

export const RightAligned = styled.div<{ mobileMode?: boolean; flexFlow?: string; flexFlowMobile?: string }>`
  display: flex;
  flex-flow: row nowrap;
  flex-flow: ${({ flexFlow }) => flexFlow || 'row nowrap'};
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  margin: 0 0 0 auto;
  height: 100%;

  ${DropdownContentItemButton} {
    min-height: 100%;
    flex-flow: row nowrap;

    > svg.arrow-icon-right {
      opacity: 1;
    }
  }

  ${({ mobileMode, flexFlowMobile }) =>
    mobileMode &&
    css`
      height: auto;
      gap: 16px;
      flex-flow: ${flexFlowMobile || 'column wrap'};
    `}
`

export const GlobalSettingsButton = styled.button<{ mobileMode?: boolean }>`
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
  transition: background 0.2s ease-in-out, fill 0.2s ease-in-out, transform 0.2s ease-in-out;
  color: inherit;

  ${({ mobileMode }) =>
    mobileMode &&
    css`
      --size: 33px;
      padding: 0;
    `}

  > svg {
    --size: 21px;
    height: var(--size);
    width: var(--size);
    color: var(--defaultFill);
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
