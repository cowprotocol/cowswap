import styled, { css } from 'styled-components/macro'
import { transparentize, darken } from 'polished'
import HeaderMod, {
  Title as TitleMod,
  HeaderLinks as HeaderLinksMod,
  HeaderControls as HeaderControlsUni,
  BalanceText as BalanceTextUni,
  AccountElement as AccountElementUni,
  StyledNavLink as StyledNavLinkUni,
  StyledMenuButton,
  HeaderFrame,
  HeaderElement as HeaderElementUni,
} from './HeaderMod'
import { MenuFlyout, MenuSection, Content as MenuContent, MenuTitle } from 'components/MenuDropdown/styled'

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

  // Special Lunar year / bunny ears theme
  > svg.imageBunnyEars {
    position: absolute;
    top: -14px;
    left: 1px;
    width: 126px;
    height: 55px;
    object-fit: contain;

    ${({ theme }) => theme.mediaWidth.upToSmall`
     left: -4px;
    `}
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

  ${({ theme }) => theme.mediaWidth.upToMedium`
    height: 100%;
  `}

  &:hover,
  &:focus {
    border: 2px solid ${({ theme }) => transparentize(0.7, theme.text1)};
  }

  ${BalanceText} {
    min-width: initial;
  }
`
