import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'
import { ThemedText } from 'theme'
import { LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { SearchInput } from 'components/SearchModal/styleds'

export const TokenSearchInput = styled(SearchInput)`
  margin-bottom: 16px;
  font-size: 14px;
  max-width: 500px;
`

export const Wrapper = styled(LightCard)`
  width: 100%;
  border: none;
  background: transparent;
  padding: 0 1rem;
`

export const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;
  grid-template-columns: 50px 5fr repeat(2, 1fr);
  text-align: left;
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
  @media screen and (max-width: 670px) {
    width: 16px;
    height: 16px;
  }
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
  margin-top: 0.2em;
  margin-bottom: 0.5em;
`

export const ArrowButton = styled.button`
  background: none;
  border: none;
`

export const Arrow = styled.div<{ faded: boolean }>`
  color: ${({ theme }) => theme.primary1};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
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

export const TableHeader = styled(ResponsiveGrid)`
  margin-bottom: 0.8rem;
`

export const TableBody = styled(AutoColumn)`
  margin-bottom: 0.8rem;
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
