import { PropsWithChildren } from 'react'

import { Media, Row, RowFixed } from '@cowprotocol/ui'
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

  ${Media.upToSmall()} {
    justify-self: center;
  }
`

export const HeaderLinksMod = styled(Row)`
  justify-content: center;

  ${Media.upToMedium()} {
    display: none;
  }
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
  border-bottom: none;
  padding: 1rem;
  z-index: 2;

  ${Media.upToLarge()} {
    grid-template-columns: 48px 1fr 1fr;
  }

  ${Media.upToMedium()} {
    grid-template-columns: 1fr 1fr;
    position: relative;
  }

  ${Media.upToExtraSmall()} {
    padding: 0.5rem 1rem;
  }
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

export const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  max-width: 100%;
  height: 100%;

  ${Media.upToMedium()} {
    margin: 0 0 0 auto;
    height: 56px;
    width: 100%;
    position: sticky;
    bottom: 0;
    left: 0;
    z-index: 101;
    background: var(${UI.COLOR_PAPER});
    padding: 5px 10px;
    flex-flow: row-reverse;
    justify-content: space-between;
  }
`

export const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  height: 100%;
`

export const Wrapper = styled.div<{ isMobileMenuOpen: boolean }>`
  width: 100%;

  ${HeaderFrame} {
    display: flex;
    padding: 16px;
    gap: 16px;

    ${Media.upToExtraSmall()} {
      gap: 10px;
    }

    ${Media.upToLarge()} {
      ${({ isMobileMenuOpen }) => css`
        ${isMobileMenuOpen &&
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
        `}
      `}
    }
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

  ${Media.upToLarge()} {
    ${({ isMobileMenuOpen }) =>
      isMobileMenuOpen &&
      css`
        z-index: 101;
      `};
  }
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

    ${Media.upToLarge()} {
      width: 100%;
      border-radius: 0;
      margin: 0;
      font-weight: 600;
      font-size: 17px;
      padding: 28px 10px;
      color: inherit;
      border-bottom: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
    }

    > svg > path {
      fill: currentColor;
      transition: fill var(${UI.ANIMATION_DURATION}) ease-in-out;
    }

    &:hover {
      color: inherit;
      background: var(${UI.COLOR_PRIMARY});
      color: var(${UI.COLOR_BUTTON_TEXT});

      ${Media.upToLarge()} {
        background: transparent;
        color: inherit;
      }

      > svg > path {
        fill: currentColor;
      }
    }

    &.expanded {
      border: 0;
    }

    &.expanded + ${MenuContent} {
      ${Media.upToLarge()} {
        border: 0;
      }
    }

    &.ACTIVE {
      color: inherit;
      font-weight: 600;
    }
  }

  ${MenuFlyout} {
    ${Media.upToLarge()} {
      width: 100%;
      flex-flow: column wrap;

      > button > svg {
        margin: 0 0 0 auto;
        height: 10px;
      }
    }

    ${Media.upToSmall()} {
      > button > svg {
        order: 3;
      }
    }
  }

  ${MenuContent} {
    ${Media.upToLarge()} {
      padding: 8px 10px 28px;
      gap: 36px;
      margin: 0;
    }
  }

  ${MenuSection} {
    ${Media.upToLarge()} {
      gap 36px;
      opacity: 0.7;
    };

    ${Media.upToMedium()} {
     width: 100%;
    };
  }

  ${MenuTitle} {
    ${Media.upToLarge()} {
      display: none;
    }
  }

  ${Media.upToLarge()} {
    display: ${({ isMobileMenuOpen }) => (isMobileMenuOpen ? 'flex' : 'none')};
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
  }
`

export const LogoImage = styled.div<{ isMobileMenuOpen?: boolean }>`
  width: 131px;
  height: 41px;
  background: none;
  margin: 0 32px 0 0;
  position: relative;

  ${Media.upToSmall()} {
    height: 30px;
    width: auto;
  }

  ${Media.upToLarge()} {
    ${({ isMobileMenuOpen }) =>
      isMobileMenuOpen &&
      css`
        height: 34px;
        width: auto;
      `}
  }

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
  ${Media.upToMedium()} {
    width: 100%;
  }
`

export const WinterHat = styled.div`
  display: flex;
  position: absolute;
  top: -10px;
  left: 6px;

  ${Media.upToSmall()} {
    left: 0;
    right: 0;
    margin: auto;
  }

  > svg {
    height: 15px;
    width: auto;
  }
`
