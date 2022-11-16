import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'
import { transparentize } from 'polished'
import { AutoColumn } from 'components/Column'
import { BaseButton } from 'components/Button'
import CurrencyLogo from 'components/CurrencyLogo'
import { HelpCircle } from 'react-feather'

export const TokenSearchInput = styled.input`
  margin: 0;
  font-size: 14px;
  width: 280px;
  align-self: flex-end;
  box-shadow: none;
  background: ${({ theme }) => theme.grey1};
  border: 1px solid ${({ theme }) => theme.bg1};
  border-radius: 21px;
  transition: background 0.2s ease-in-out, width 0.2s ease-in-out;
  appearance: none;
  height: 44px;
  padding: 0 16px;
  outline: 0;

  &:focus {
    width: 500px;
    background: ${({ theme }) => theme.bg1};
    outline: 0;
  }

  &::placeholder {
    font-size: 14px !important;
    color: ${({ theme }) => transparentize(0.5, theme.darkMode ? theme.white : theme.text1)};
  }

  &:focus::placeholder {
    color: ${({ theme }) => transparentize(0.3, theme.darkMode ? theme.white : theme.text1)};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 350px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    text-align: center;
    font-size: 12px !important;
    align-self: flex-start;
    max-width: 100%;

    ::placeholder {
      font-size: 12px !important;
    }
  `};
`

export const Wrapper = styled.div`
  width: 100%;
  border: none;
  padding: 0;
  background: ${({ theme }) => theme.bg1};
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.boxShadow1};
`

export const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 16px;
  width: 100%;
  height: 58px;
  font-size: 14px;
  align-items: center;
  text-align: left;
  border: 0;
  padding: 0 16px;
  grid-template-columns: 40px 7fr 2fr 2fr 4fr;
  background: transparent;
  transition: background 0.1s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.grey1};
  }
`

export const LinkWrapper = styled(Link)`
  text-decoration: none;
  padding: 0.8rem 0;
  display: flex;
  align-items: center;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

export const ResponsiveLogo = styled(CurrencyLogo)`
  width: 28px;
  height: 28px;
  border-radius: 28px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 16px;
    height: 16px;
  `};
`

export const Label = styled.div<{ end?: number }>`
  display: flex;
  font-size: inherit;
  font-weight: 400;
  justify-content: ${({ end }) => (end ? 'flex-end' : 'flex-start')};
  color: ${({ theme }) => theme.text1};
  align-items: center;
  font-variant-numeric: tabular-nums;
  word-break: break-all;
  overflow: hidden;

  > span {
    display: flex;
    align-items: center;
    max-width: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > span > b {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    font-weight: 500;
    display: inline-block;
  }

  > span > i {
    opacity: 0.6;
    margin: 0 0 0 4px;
    font-style: normal;
    display: inline-block;
    text-transform: uppercase;
  }
`

export const ClickableText = styled(Label)<{ disabled?: boolean }>`
  text-align: end;
  user-select: none;

  ${({ disabled }) =>
    !disabled &&
    `
    &:hover {
      cursor: pointer;
      opacity: 0.6;
    }
  `}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`

export const PageButtons = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.8em;
  margin-bottom: 0.5em;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`

export const PaginationText = styled.span`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 10px;
  `};

  white-space: nowrap;
`

export const ArrowButton = styled.button`
  background: none;
  border: none;
`

export const Arrow = styled.div<{ faded: boolean }>`
  color: ${({ theme }) => theme.text1};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 10px;
  user-select: none;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 5px;
  `};

  ${({ faded }) =>
    !faded &&
    `
    :hover {
      cursor: pointer;
    }
  `}
`

export const Break = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.bg5};
  width: 100%;
`

export const HideLarge = styled.span`
  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: none;
  `};
`

export const HideMedium = styled.span`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `};
`

export const HideExtraSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

export const MediumOnly = styled.span`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: block;
  `};
`

export const LargeOnly = styled.span`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: block;
  `};
`

export const TableHeader = styled(ResponsiveGrid)`
  padding: 16px;
  background: ${({ theme }) => (theme.darkMode ? transparentize(0.9, theme.bg2) : transparentize(0.7, theme.bg1))};
  border-bottom: 1px solid ${({ theme }) => theme.grey1};

  &:hover {
    background: transparent;
  }

  ${Label} {
    opacity: 0.75;
  }
`

export const TableBody = styled(AutoColumn)`
  margin: 0 0 16px;
  padding: 10px 0 0;
  gap: 0;
`

export const Cell = styled.div`
  display: flex;
  padding: 0;
  justify-content: flex-start;
  align-items: center;

  > a {
    text-decoration-color: transparent;
    transition: text-decoration-color 0.2s ease-in-out;
    overflow: hidden;
    display: flex;

    &:hover {
      text-decoration-color: ${({ theme }) => theme.text1};
    }
  }
`

export const IndexNumber = styled.span`
  font-size: 14px;
  font-weight: 400;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`

export const BalanceValue = styled.span<{ hasBalance: boolean }>`
  color: ${({ hasBalance, theme }) => theme[hasBalance ? 'text1' : 'text3']};
  font-variant-numeric: tabular-nums;
  font-weight: 400;
  font-size: 14px;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`

export const TableButton = styled(BaseButton)<{ color?: string; outlined?: boolean; text?: boolean }>`
  font-size: 14px;
  padding: 3px 15px;
  width: auto;
  font-weight: 400;
  transition: all 0.15s ease-in;
  background: ${({ color }) => transparentize(0.2, color || 'transparent')};
  color: ${({ theme }) => theme.text1};
  white-space: nowrap;
  position: relative;

  &:hover {
    background: ${({ theme, color }) => color || theme.text1};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 10px;
  `};

  ${({ theme, outlined, color }) =>
    outlined &&
    `
      background: transparent;
      color: ${color || theme.text1};
      border: 1px solid ${color || theme.text1};
      :hover {
        color: white;
      }
  `};

  ${({ theme, text, color }) =>
    text &&
    `
      background: none;
      border: none;
      color: ${color || theme.text1};
      padding: 0;

      :hover {
        background: none;
      }
  `};
`

export const Table = styled(AutoColumn)`
  overflow-y: auto;
  scrollbar-color: ${({ theme }) => `${theme.card.border} ${theme.card.background2}`};
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    height: 6px;
    background: ${({ theme }) => `${theme.card.background2}`} !important;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => `${theme.card.border}`} !important;
    border: 3px solid transparent;
    background-clip: padding-box;
  }

  &::-webkit-scrollbar-track {
    height: 5px;
  }
`

export const TokenText = styled.div`
  display: flex;
  align-items: center;
  text-align: left;
  margin: 0 0 0 12px;
  font-size: 16px;
`

export const ApproveLabel = styled.span<{ color?: string }>`
  font-size: 12px;
  color: ${({ theme, color }) => color || theme.text1};
`

export const CustomLimit = styled.div`
  span:last-child {
    cursor: default;
    font-size: 10px;
    margin-top: 5px;
    display: block;
  }
`

export const IndexLabel = styled(Label)`
  padding: 0;
`

export const FiatValue = styled.div`
  display: flex;
  align-items: center;
`

export const InfoCircle = styled(HelpCircle)`
  stroke: ${({ theme }) => theme.text1};
  width: 15px;
  height: 15px;
  margin-left: 5px;
  vertical-align: middle;
  margin-bottom: 2px;
`
