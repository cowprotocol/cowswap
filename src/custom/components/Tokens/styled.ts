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

    ${({ theme }) => theme.mediaWidth.upToMedium`
      width: 100%;
    `};
  }

  &::placeholder {
    font-size: 14px !important;
    color: ${({ theme }) => transparentize(0.5, theme.darkMode ? theme.white : theme.text1)};
  }

  &:focus::placeholder {
    color: ${({ theme }) => transparentize(0.3, theme.darkMode ? theme.white : theme.text1)};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 100%;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    text-align: center;
    font-size: 12px !important;
    align-self: flex-start;

    &::placeholder {
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

// export const ResponsiveGrid = styled.div`
//   display: grid;
//   grid-gap: 16px;
//   width: 100%;
//   height: 58px;
//   font-size: 14px;
//   align-items: center;
//   text-align: left;
//   border: 0;
//   padding: 0 16px;
//   grid-template-columns: 40px 7fr 2fr 2fr 4fr;
//   background: transparent;
//   transition: background 0.1s ease-in-out;

//   &:hover {
//     background: ${({ theme }) => theme.grey1};
//   }
// `

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
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1}!important; // TODO: prevent styles override

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 21px;
    height: 21px;
    border-radius: 21px;
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
`

export const PageButtons = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px auto;
`

export const PaginationText = styled.span`
  font-size: 13px;
  white-space: nowrap;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 15px;
  `};
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

// export const TableHeader = styled(ResponsiveGrid)`
//   padding: 16px;
//   border-bottom: 1px solid ${({ theme }) => theme.grey1};

//   &:hover {
//     background: transparent;
//   }

//   ${Label} {
//     opacity: 0.75;
//   }
// `

// export const TableBody = styled(AutoColumn)`
//   margin: 0 0 16px;
//   padding: 10px 0 0;
//   gap: 0;

//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     padding: 0 56px 16px 0;
//   `};
// `

export const Cell = styled.div`
  display: flex;
  padding: 0;
  justify-content: flex-start;
  align-items: center;

  &:nth-child(5n) {
    justify-content: flex-end;
    gap: 10px;
  }

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
`

export const TableButton = styled(BaseButton)<{ color?: string; outlined?: boolean; text?: boolean }>`
  font-size: 14px;
  padding: 0;
  width: auto;
  font-weight: 400;
  transition: all 0.15s ease-in;
  background: transparent;
  color: ${({ theme, color }) => color || theme.text1};
  white-space: nowrap;
  position: relative;

  &:hover {
    background: transparent;
    text-decoration: underline;
  }

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
  display: grid;
  grid-gap: 16px;
  width: 100%;
  font-size: 14px;
  align-items: center;
  text-align: left;
  border: 0;
  padding: 0 16px;
  grid-template-columns: 40px auto repeat(3, min-content);
  background: transparent;
  transition: background 0.1s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.grey1};
  }

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

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 13px;
  `};
`

export const ApproveLabel = styled.span<{ color?: string }>`
  color: ${({ theme, color }) => color || theme.text1};
  font-weight: 500;
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
