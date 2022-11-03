import { ChevronDown } from 'react-feather'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { Card } from '@cow/pages/Account/styled'
import { darken } from 'polished'

export const MenuWrapper = styled.div`
  position: relative;
`

export const MenuButton = styled.button`
  background: none;
  outline: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg1};
  height: 44px;
  border-radius: 21px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  font-size: 16px;
`

export const StyledChevronDown = styled(ChevronDown)`
  margin-left: 5px;
  font-size: 16px;
`

export const Menu = styled.div`
  border-radius: 16px;
  background: ${({ theme }) => (theme.darkMode ? darken(0.09, theme.bg5) : theme.bg4)};
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

  ${({ theme }) => theme.mediaWidth.upToSmall`
    left: 50%;
    transform: translateX(-50%) translateY(105%);
  `}
`

export const MenuItem = styled.div<{ active: boolean }>`
  transition: background 0.2s ease-in;
  background-color: ${({ active, theme }) => (active ? theme.grey1 : 'transparent')};
  color: ${({ active, theme }) => (active ? theme.text2 : theme.text1)};
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
  grid-template-columns: 120px 950px;
  flex-direction: column;
  margin: 0 16px;
  width: 100%;
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
  margin: 0 auto;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  `};
`

export const MainText = styled(ThemedText.Main)`
  color: ${({ theme }) => theme.text1};
  font-size: 14px;
`

export const AccountCard = styled(Card)`
  min-height: auto;
  margin-bottom: 1rem;
`

export const AccountHeading = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0 20px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
  `}
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

  ${({ theme }) => theme.mediaWidth.upToLarge`
    flex-direction: column;
    align-items: flex-start;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: center;
    align-items: center;
    width: 100%;
  `};
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
  background: ${({ theme }) => theme.bg1};
  border-radius: 16px;
  gap: 16px;
  margin: 0;
  padding: 0;
  z-index: 2;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: column wrap;
  `};
`
