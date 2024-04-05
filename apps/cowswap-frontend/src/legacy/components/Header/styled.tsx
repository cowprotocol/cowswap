import { PropsWithChildren } from 'react'

import { Row, RowFixed } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import useScrollPosition from '@react-hook/window-scroll'
import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components/macro'

import { MenuFlyout, MenuSection, Content as MenuContent, MenuTitle } from 'legacy/components/MenuDropdown/styled'

const activeClassName = 'active'

export const TitleMod = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;

  &:hover {
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
`

export const HeaderLinksMod = styled(Row)`
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `};
`

export const HeaderControlsUni = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
`

export const StyledNavLinkUni = styled(NavLink)`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: inherit;
  }

  :hover,
  :focus {
    color: inherit;
  }
`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;
  color: inherit;

  &:hover,
  &:focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }
`

export const HeaderFrame = styled.div<{ showBackground: boolean }>`
  display: grid;
  grid-template-columns: 1fr 120px;
  grid-template-rows: max-content;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  border-bottom: ${({ theme }) => theme.header.border};
  padding: 1rem;
  z-index: 2;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 48px 1fr 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr 1fr;
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0.5rem 1rem;
  `};
`

export const StyledNavLink = styled(StyledNavLinkUni)`
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;
  color: inherit;

  &:first-of-type {
    margin: 0 12px 0 0;
  }

  &:hover,
  &:focus {
    color: inherit;
  }
`

export const HeaderControls = styled(HeaderControlsUni)`
  justify-content: flex-end;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    max-width: 100%;
    margin: 0 0 0 auto;
    padding: 0;
    height: auto;
    width: auto;
  `};
`

export const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToTiny`
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: var(${UI.COLOR_PAPER});
    padding: 5px;
    justify-content: flex-end;
  `};
`

export const Wrapper = styled.div<{ isMobileMenuOpen: boolean }>`
  width: 100%;

  ${HeaderFrame} {
    display: flex;
    padding: 16px;
    gap: 16px;

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      gap: 10px;
    `};

    ${({ theme, isMobileMenuOpen }) => theme.mediaWidth.upToLarge`

      ${
        isMobileMenuOpen &&
        css`
          position: absolute;
          top: 0;
          z-index: 3;

          &::before {
            content: '';
            width: 100%;
            display: flex;
            height: 60px;
            background: var(${UI.COLOR_PAPER});
            position: fixed;
            top: 0;
            left: 0;
            z-index: 101;
          }
        `
      }
    `}
  }

  ${StyledMenuButton} {
    margin: 0 0 0 10px;
    padding: 0;
    height: 38px;
    width: 38px;
  }
`

function HeaderMod({ children }: PropsWithChildren<void>) {
  const scrollY = useScrollPosition()

  return <HeaderFrame showBackground={scrollY > 45}>{children}</HeaderFrame>
}

export const HeaderModWrapper = styled(HeaderMod)``

export const Title = styled(TitleMod)<{ isMobileMenuOpen: boolean }>`
  margin: 0;
  text-decoration: none;
  color: inherit;

  ${({ theme, isMobileMenuOpen }) => theme.mediaWidth.upToLarge`
    ${
      isMobileMenuOpen &&
      css`
        z-index: 101;
      `
    }
  `};
`

export const HeaderLinks = styled(HeaderLinksMod)<{ isMobileMenuOpen: boolean }>`
  margin: 0;

  // Enforce uniform styling of different menu items/components
  > ${StyledNavLink}, > ${MenuFlyout} > button {
    font-size: 16px;
    position: relative;
    border-radius: 16px;
    display: flex;
    align-items: center;
    font-weight: 500;
    appearance: none;
    outline: 0;
    margin: 0 4px;
    padding: 8px 12px;
    border: 0;
    cursor: pointer;
    background: transparent;
    transition: background var(${UI.ANIMATION_DURATION}) ease-in-out, color var(${UI.ANIMATION_DURATION}) ease-in-out;
    color: inherit;

    ${({ theme }) => theme.mediaWidth.upToLarge`
      width: 100%;
      border-radius: 0;
      margin: 0;
      font-weight: 600;
      font-size: 17px;
      padding: 28px 10px;
      color: inherit;
      border-bottom: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
    `}

    > svg > path {
      fill: currentColor;
      transition: fill var(${UI.ANIMATION_DURATION}) ease-in-out;
    }

    &:hover {
      color: inherit;
      background: var(${UI.COLOR_PRIMARY});
      color: var(${UI.COLOR_BUTTON_TEXT});

      ${({ theme }) => theme.mediaWidth.upToLarge`
        background: transparent;
        color: inherit;
      `};

      > svg > path {
        fill: currentColor;
      }
    }

    &.expanded {
      border: 0;
    }

    &.expanded + ${MenuContent} {
      ${({ theme }) => theme.mediaWidth.upToLarge`
        border: 0;
      `}
    }

    &.ACTIVE {
      color: inherit;
      font-weight: 600;
    }
  }

  ${MenuFlyout} {
    ${({ theme }) => theme.mediaWidth.upToLarge`
      width: 100%;
      flex-flow: column wrap;

      > button > svg {
        margin: 0 0 0 auto;
        height: 10px;
      }
    `};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      > button > svg {
        order: 3;
      }
    `};
  }

  ${MenuContent} {
    ${({ theme }) => theme.mediaWidth.upToLarge`
      padding: 8px 10px 28px;
      gap: 36px;
      margin: 0;
    `};
  }

  ${MenuSection} {
    ${({ theme }) => theme.mediaWidth.upToLarge`
      gap 36px;
      opacity: 0.7;
    `};

    ${({ theme }) => theme.mediaWidth.upToMedium`
     width: 100%;
    `};
  }

  ${MenuTitle} {
    ${({ theme }) => theme.mediaWidth.upToLarge`
      display: none;
    `};
  }

  ${({ theme, isMobileMenuOpen }) => theme.mediaWidth.upToLarge`
    display: ${isMobileMenuOpen ? 'flex' : 'none'};
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 3;
    background: var(${UI.COLOR_PAPER});
    outline: 0;
    padding: 60px 8px;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch; // iOS scroll fix
    transform: translate3d(0,0,0); // iOS scroll fix
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: flex-start;
`};
`

export const TwitterLink = styled(StyledMenuButton)`
  > a {
    ${({ theme }) => theme.cursor};
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }

  > a > svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border: 0;
    display: flex;
    margin: 0;
    padding: 0;
    stroke: transparent;
  }

  > a > svg > path {
    fill: var(${UI.COLOR_TEXT});
  }

  > a:hover > svg > path {
    fill: var(${UI.COLOR_TEXT});
  }
`

export const LogoImage = styled.div<{ isMobileMenuOpen?: boolean }>`
  width: 131px;
  height: 41px;
  background: none;
  margin: 0 32px 0 0;
  position: relative;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 30px;
    width: auto;
  `}

  ${({ theme, isMobileMenuOpen }) => theme.mediaWidth.upToLarge`
    ${
      isMobileMenuOpen &&
      css`
        height: 34px;
        width: auto;
      `
    }
  `}

  > svg {
    width: inherit;
    height: inherit;
    object-fit: contain;
  }
`

export const UniIcon = styled.div`
  display: flex;
  position: relative;
  transition: transform 0.3s ease;

  &:hover {
    transform: rotate(-5deg);
  }
`

export const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};
`

export const WinterHat = styled.div`
  display: flex;
  position: absolute;
  top: -10px;
  left: 6px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    left: 0;
    right: 0;
    margin: auto;
  `}

  > svg {
    height: 15px;
    width: auto;
  }
`
