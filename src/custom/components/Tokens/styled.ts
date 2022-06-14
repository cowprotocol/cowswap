import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'
import { ThemedText } from 'theme'
import { LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { BaseButton } from 'components/Button'
import { transparentize } from 'polished'

export const Wrapper = styled(LightCard)`
  width: 100%;
  border: none;
  background: transparent;
`

export const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;
  text-align: left;
  border-bottom: 1px solid ${({ theme }) => theme.bg5};
  grid-template-columns: 50px minmax(80px, auto) minmax(70px, 120px) repeat(2, 55px) 100px;
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
  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 16px;
    height: 16px;
  `};
`

export const Label = styled(ThemedText.Label)<{ end?: number }>`
  display: flex;
  font-size: 14px;
  font-weight: 400;
  justify-content: ${({ end }) => (end ? 'flex-end' : 'flex-start')};
  color: ${({ theme }) => theme.text1};
  align-items: center;
  font-variant-numeric: tabular-nums;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`

export const ClickableText = styled(Label)`
  text-align: end;
  user-select: none;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

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
`

export const ArrowButton = styled.button`
  background: none;
  border: none;
`

export const Arrow = styled.div<{ faded: boolean }>`
  color: ${({ theme }) => theme.primary1};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 10px;
  user-select: none;

  :hover {
    cursor: pointer;
  }
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
  padding-bottom: 10px;
`

export const TableBody = styled(AutoColumn)`
  margin-bottom: 0.8rem;
`

export const Cell = styled.div<{ center?: boolean }>`
  display: flex;
  padding: 12px 0;
  justify-content: ${({ center }) => (center ? 'center' : 'flex-start')};

  > * {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
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

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`

export const TableButton = styled(BaseButton)<{ color?: string; outlined?: boolean; text?: boolean }>`
  font-size: 12px;
  padding: 3px 15px;
  width: auto;
  font-weight: 400;
  transition: all 0.15s ease-in;
  background: ${({ theme, color }) => transparentize(0.4, color || theme.primary1)};
  white-space: nowrap;
  position: relative;

  :hover {
    background: ${({ theme, color }) => color || theme.primary1};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 10px;
  `};

  ${({ theme, outlined, color }) =>
    outlined &&
    `
      background: transparent;
      color: ${color || theme.primary1};
      border: 1px solid ${color || theme.primary1};
      :hover {
        color: white;
      }
  `};

  ${({ theme, text, color }) =>
    text &&
    `
      background: none;
      border: none;
      color: ${color || theme.primary1};
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
`

export const ApproveLabel = styled.span<{ color?: string }>`
  font-size: 12px;
  color: ${({ theme, color }) => color || theme.text1};
`

export const CustomLimit = styled.div`
  padding: 0 2px;

  span:last-child {
    cursor: default;
    font-size: 10px;
    margin-top: 5px;
    display: block;
  }
`
