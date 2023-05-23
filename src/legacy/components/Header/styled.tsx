import styled, { css } from 'styled-components/macro'
import { transparentize, darken } from 'polished'
import { MenuFlyout, MenuSection, Content as MenuContent, MenuTitle } from 'legacy/components/MenuDropdown/styled'
import Row, { RowFixed } from 'legacy/components/Row'
import { Text } from 'rebass'
import { NavLink } from 'react-router-dom'
import useScrollPosition from '@react-hook/window-scroll'
import { PropsWithChildren } from 'react'

const activeClassName = 'active'

export const TitleMod = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
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

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    max-width: 960px;
    padding: 1rem;
    z-index: 1;
    height: 72px;
    border-radius: 12px 12px 0 0;
  `};
`

export const BalanceTextUni = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

export const AccountElementUni = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 12px;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  white-space: nowrap;
  width: 100%;
  cursor: pointer;

  :focus {
    border: 1px solid blue;
  }
`

export const StyledNavLinkUni = styled(NavLink)`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;
  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
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

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

export const HeaderFrame = styled.div<{ showBackground: boolean }>`
  display: grid;
  grid-template-columns: 1fr 120px;
  //align-items: center;
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
    /*padding:  1rem;*/
    grid-template-columns: 1fr 1fr;
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0.5rem 1rem;
    /*grid-template-columns: 36px 1fr;*/
  `};
`

export const HeaderElementUni = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row-reverse;
    align-items: center;
  `};

  ${({ theme }) => theme.mediaWidth.upToVerySmall`
    width: 115px;
  `};
`

export const StyledNavLink = styled(StyledNavLinkUni)`
  transition: color 0.15s ease-in-out;
  color: ${({ theme }) => darken(0.3, theme.text1)};

  &:first-of-type {
    margin: 0 12px 0 0;
  }

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.text1};
  }
`

export const BalanceText = styled(BalanceTextUni)`
  font-weight: 500;
  font-size: 13px;
  padding: 0 6px 0 12px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    overflow: hidden;
    max-width: 100px;
    text-overflow: ellipsis;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
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

export const HeaderElement = styled(HeaderElementUni)`
  border-radius: 0;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: flex-end;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    border-radius: 0;
    height: 64px;
    background-color: ${({ theme }) => theme.bg1};
    border-top: 1px solid ${({ theme }) => theme.grey1};
    backdrop-filter: blur(21px);
    padding: 10px 16px;
    gap: 8px;
  `}
`

export const Wrapper = styled.div<{ isMobileMenuOpen: boolean }>`
  width: 100%;

  ${HeaderFrame} {
    padding: 16px;
    display: flex;

    ${({ theme, isMobileMenuOpen }) => theme.mediaWidth.upToLarge`
      grid-template-columns: unset;

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
            background: ${({ theme }) => theme.bg1};
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
  color: ${({ theme }) => theme.text1};

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
    background: 0;
    border: 0;
    cursor: pointer;
    background: transparent;
    transition: background 0.15s ease-in-out, color 0.15s ease-in-out;
    color: ${({ theme }) => theme.text2};

    ${({ theme }) => theme.mediaWidth.upToLarge`
      width: 100%;
      border-radius: 0;
      margin: 0;
      font-weight: 600;
      font-size: 17px;
      padding: 28px 10px;
      color: ${({ theme }) => theme.text1};
      border-bottom: 1px solid ${({ theme }) => transparentize(0.9, theme.text1)};
    `};

    > svg > path {
      fill: ${({ theme }) => theme.text2};
      transition: fill 0.15s ease-in-out;
    }

    &:hover {
      color: ${({ theme }) => theme.text1};
      background: ${({ theme }) => transparentize(0.95, theme.text1)};

      ${({ theme }) => theme.mediaWidth.upToLarge`
        background: transparent;
      `};

      > svg > path {
        fill: ${({ theme }) => theme.text1};
      }
    }

    &.expanded {
      border: 0;
    }

    &.expanded + ${MenuContent} {
      ${({ theme }) => theme.mediaWidth.upToLarge`
        border: 0;
      `};
    }

    &.ACTIVE {
      color: ${({ theme }) => theme.text1};
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
  }

  ${MenuTitle} {
    ${({ theme }) => theme.mediaWidth.upToLarge`
      display: none;
    `};
  }}

  ${({ theme, isMobileMenuOpen }) => theme.mediaWidth.upToLarge`
    display: none;
    width: 100%;
    height: 100%;
    position: fixed;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 3;
    background: ${({ theme }) => theme.bg1};
    outline: 0;
    padding: 60px 8px;
    overflow-x: hidden;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch; // iOS scroll fix
    transform: translate3d(0,0,0); // iOS scroll fix

    ${
      isMobileMenuOpen &&
      css`
        display: flex;
      `
    }
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
    fill: ${({ theme }) => theme.text1};
  }

  > a:hover > svg > path {
    fill: ${({ theme }) => theme.text1};
  }
`

export const LogoImage = styled.div<{ isMobileMenuOpen?: boolean }>`
  width: 131px;
  height: 41px;
  background: none;
  margin: 0 32px 0 0;
  position: relative;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 34px;
    width: 106px;
  `}

  ${({ theme, isMobileMenuOpen }) => theme.mediaWidth.upToLarge`
    ${
      isMobileMenuOpen &&
      css`
        height: 34px;
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

export const AccountElement = styled(AccountElementUni)<{ active: boolean }>`
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg1)};
  border-radius: 21px;
  border: 2px solid transparent;
  transition: border 0.2s ease-in-out;
  pointer-events: auto;
  width: auto;

  &:hover {
    border: 2px solid ${({ theme }) => transparentize(0.7, theme.text1)};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    height: 100%;
  `}

  ${BalanceText} {
    min-width: initial;
  }
`

export const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};
`
