import useScrollPosition from '@react-hook/window-scroll'
import { darken } from 'polished'
import { NavLink } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components/macro'
import Row, { RowFixed } from 'components/Row'

import { PropsWithChildren } from 'react'

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
  /*position: relative;
  /!* Background slide effect on scroll. *!/
  background-image: ${({ theme }) => `linear-gradient(to bottom, transparent 50%, ${theme.bg0} 50% )}}`};
  background-position: ${({ showBackground }) => (showBackground ? '0 -100%' : '0 0')};
  background-size: 100% 200%;
  box-shadow: 0px 0px 0px 1px ${({ theme, showBackground }) => (showBackground ? theme.bg2 : 'transparent;')};
  transition: background-position 0.1s, box-shadow 0.1s;
  background-blend-mode: hard-light;*/

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

export const HeaderControls = styled.div`
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

export const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  /* &:not(:first-child) {
    margin-left: 0.5em;
  } */

  /* addresses safari's lack of support for "gap" */
  /* & > *:not(:first-child) {
    margin-left: 8px;
  } */

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row-reverse;
    align-items: center;
  `};

  ${({ theme }) => theme.mediaWidth.upToVerySmall`
    width: 115px;
  `};
`

export const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
      display: none;
    `};
`

export const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};
`

export const HeaderLinks = styled(Row)`
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `};
  /* justify-self: center;
  background-color: ${({ theme }) => theme.bg0};
  width: fit-content;
  padding: 2px;
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  overflow: auto;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    justify-self: start;
    `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: center;
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    z-index: 99;
    position: fixed;
    bottom: 0; right: 50%;
    transform: translate(50%,-50%);
    margin: 0 auto;
    background-color: ${({ theme }) => theme.bg0};
    border: 1px solid ${({ theme }) => theme.bg2};
    box-shadow: 0px 6px 10px rgb(0 0 0 / 2%);
  `}; */
`

export const AccountElement = styled.div<{ active: boolean }>`
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

export const UNIAmount = styled(AccountElement)`
  color: white;
  padding: 4px 8px;
  height: 36px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #ff007a 0%, #2172e5 100%), #edeef2;
`

export const UNIWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;

  /* :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.9;
  } */
`

export const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

export const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  // margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`

const activeClassName = 'active'

export const StyledNavLink = styled(NavLink)`
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
  /* padding: 8px 12px;
  word-break: break-word;
  overflow: hidden;
  white-space: nowrap; */
  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    /* justify-content: center; */
    color: ${({ theme }) => theme.text1};
    /* background-color: ${({ theme }) => theme.bg1}; */
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

export default function Header({ children }: PropsWithChildren<void>) {
  const scrollY = useScrollPosition()

  return <HeaderFrame showBackground={scrollY > 45}>{children}</HeaderFrame>
}
