import { UI } from '@cowprotocol/ui'

import { transparentize, darken } from 'color2k'
import { ChevronDown } from 'react-feather'
import styled from 'styled-components/macro'

import Column from 'legacy/components/Column'
import { ThemedText } from 'legacy/theme'

import { Card } from 'pages/Account/styled'

export const MenuWrapper = styled.div`
  position: relative;
`

export const MenuButton = styled.button`
  background: none;
  outline: none;
  border: none;
  cursor: pointer;
  color: inherit;
  background: var(${UI.COLOR_PAPER});
  height: 44px;
  border-radius: 21px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  font-size: 16px;
  white-space: nowrap;
`

export const StyledChevronDown = styled(ChevronDown)`
  margin-left: 5px;
  font-size: 16px;
`

export const Menu = styled.div`
  border-radius: 16px;
  background: ${({ theme }) => (theme.darkMode ? darken(theme.bg5, 0.09) : theme.bg4)};
  box-shadow: 0 12px 18px ${({ theme }) => theme.bg5};
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  bottom: 0;
  transform: translateY(105%);
  max-width: 400px;
  min-width: 250px;
  z-index: 99;
  padding: 12px;
`

export const MenuItem = styled.div<{ active: boolean }>`
  transition: background 0.2s ease-in;
  background-color: ${({ active, theme }) => (active ? theme.grey1 : 'transparent')};
  color: ${({ active, theme }) => (active ? theme.text2 : `var(${UI.COLOR_TEXT})`)};
  justify-content: space-between;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  display: flex;

  :not(:last-child) {
    margin-bottom: 5px;
  }
`

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 120px minmax(auto, 950px);
  grid-template-rows: max-content;
  margin: 0;
  width: 100%;
  max-width: 100%;
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    flex-flow: column wrap;
  `}
`

export const AccountPageWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  border: none;
  background: none;
  padding: 0;
  margin: 0;
`

export const MainText = styled(ThemedText.Main)`
  color: inherit;
  font-size: 14px;
`

export const AccountCard = styled(Card)`
  min-height: auto;
  margin-bottom: 1rem;
`

export const AccountHeading = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  padding: 0 0 20px;
  gap: 12px;
`

export const RemoveTokens = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text3};
  cursor: pointer;
`

export const WrongNetwork = styled.div`
  max-width: 200px;
`

export const LeftSection = styled.div`
  display: flex;
`

export const ClearSearchInput = styled.div`
  position: absolute;
  right: 10px;
  cursor: pointer;
  top: 0;
  bottom: 0;
  margin: auto;
  display: flex;
  align-items: center;
`

export const Overview = styled.div`
  background: var(${UI.COLOR_PAPER});
  color: inherit;
  border-radius: 16px;
  gap: 16px;
  margin: 0;
  padding: 0;
  z-index: 2;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.boxShadow1};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    flex-flow: column wrap;

    &::after {
      content: "";
      display: block;
      background: linear-gradient(to left, ${({ theme }) => theme.bg1} 0%, ${({ theme }) =>
    transparentize(theme.bg1, 1)} 100%);
      pointer-events: none;
      height: 100%;
      width: 80px;
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      z-index: 1;
    }
  `};
`

export const SearchInputFormatter = styled(Column)`
  width: 100%;
  flex: 1 1 fit-content;
  position: relative;
  color: inherit;

  > input {
    border: none;
    transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
    background: var(${UI.COLOR_PAPER});
    color: inherit;
  }

  > input::placeholder {
    font-size: 16px;
    color: inherit;
    opacity: 0.5;
  }
`

export const TokenSearchInput = styled.input`
  margin: 0;
  font-size: 14px;
  max-width: 280px;
  width: 100%;
  align-self: flex-end;
  box-shadow: none;
  background: var(${UI.COLOR_PAPER_DARKER});
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 21px;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out, max-width var(${UI.ANIMATION_DURATION}) ease-in-out;
  appearance: none;
  height: 44px;
  padding: 0 16px;
  outline: 0;

  &:focus {
    max-width: 500px;
    background: var(${UI.COLOR_PAPER});
    outline: 0;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      width: 100%;
    `};
  }

  &::placeholder {
    font-size: 14px !important;
    color: inherit;
    opacity: 0.5;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  &:focus::placeholder {
    color: inherit;
    opacity: 1;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 100%;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px !important;

    &::placeholder {
      font-size: 12px !important;
    }
  `};
`
