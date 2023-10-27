import { BaseButton } from '@cowprotocol/ui'

import { transparentize } from 'polished'
import { HelpCircle } from 'react-feather'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'
import { CurrencyLogo } from 'common/pure/CurrencyLogo'

export const TokenSearchInput = styled.input`
  margin: 0;
  font-size: 14px;
  max-width: 280px;
  width: 100%;
  align-self: flex-end;
  box-shadow: none;
  background: var(${UI.COLOR_GREY});
  color: var(${UI.COLOR_TEXT1});
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 21px;
  transition: background 0.2s ease-in-out, max-width 0.2s ease-in-out;
  appearance: none;
  height: 44px;
  padding: 0 16px;
  outline: 0;

  &:focus {
    max-width: 500px;
    outline: 0;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      width: 100%;
    `};
  }

  &::placeholder {
    font-size: inherit;
    color: ${({ theme }) => transparentize(0.5, theme.darkMode ? theme.white : theme.text1)};
  }

  &:focus::placeholder {
    color: ${({ theme }) => transparentize(0.3, theme.darkMode ? theme.white : theme.text1)};
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

export const Wrapper = styled.div`
  width: 100%;
  border: none;
  padding: 0;
  background: var(${UI.COLOR_CONTAINER_BG_01});
  border-radius: 16px;
  display: grid;
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
  background: var(${UI.COLOR_CONTAINER_BG_01});
  color: var(${UI.COLOR_TEXT1}) !important; // TODO: prevent styles override

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 21px;
    height: 21px;
    border-radius: 21px;
  `}
`

export const Label = styled.div<{ end?: number }>`
  display: flex;
  font-size: inherit;
  font-weight: 400;
  justify-content: ${({ end }) => (end ? 'flex-end' : 'flex-start')};
  color: ${({ theme }) => transparentize(0.1, theme.text1)};
  align-items: center;
  font-variant-numeric: tabular-nums;
  word-break: break-all;
  overflow: hidden;
  font-size: 13px;

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
  color: var(${UI.COLOR_TEXT1});
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

export const Row = styled.div`
  width: 100%;
  display: grid;
  grid-gap: 16px;
  grid-template-columns: 62px 430px repeat(2, 100px) 1fr;
  padding: 16px;
  justify-content: flex-start;
  align-items: center;
  background: transparent;
  transition: background 0.2s ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: auto;
    grid-template-columns: 62px 330px repeat(2,150px) 200px;
  `}

  &:hover {
    background: var(${UI.COLOR_GREY});
  }
`

export const TableHeader = styled(Row)`
  border-bottom: 1px solid ${({ theme }) => theme.grey1};

  &:hover {
    background: transparent;
  }

  ${Label} {
    opacity: 0.75;
  }
`

export const Cell = styled.div`
  display: flex;
  gap: 8px;

  // 1st STAR column
  &:nth-child(1n) {
    gap: 0;
  }

  // ACTIONS column
  &:nth-child(5n) {
    gap: 10px;
    display: flex;
    flex-flow: row wrap;

    > span {
      white-space: nowrap;
    }
  }

  > a {
    text-decoration-color: transparent;
    transition: text-decoration-color 0.2s ease-in-out;
    overflow: hidden;
    display: flex;
    color: var(${UI.COLOR_TEXT1});

    &:hover {
      color: var(${UI.COLOR_TEXT1});
      text-decoration-color: var(${UI.COLOR_TEXT1});
    }
  }
`

export const IndexNumber = styled.span`
  font-size: 14px;
  font-weight: 400;
`

export const BalanceValue = styled.span<{ hasBalance: boolean }>`
  color: ${({ hasBalance, theme }) => (hasBalance ? `var(${UI.COLOR_TEXT1})` : transparentize(0.3, theme.text1))};
  font-weight: 500;
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
  transition: color 0.15s ease-in-out, opacity 0.15s ease-in-out;
  background: transparent;
  color: ${({ theme, color }) => color || theme.text1};
  white-space: nowrap;
  position: relative;
  opacity: 0.7;

  &:hover {
    background: transparent;
    text-decoration: underline;
    opacity: 1;
  }

  > svg {
    width: 16px;
    height: 16px;
    max-width: 100%;
    max-height: 100%;

    > path {
      fill: var(${UI.COLOR_TEXT1});
    }
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

export const Table = styled.div`
  display: flex;
  flex-flow: column wrap;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  width: 100%;
  min-height: 400px;
  font-size: 14px;
  align-items: center;
  text-align: left;
  border: 0;
  padding: 0;
  background: transparent;
  transition: background 0.1s ease-in-out;
  ${({ theme }) => theme.colorScrollbar};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-height: 250px;
  `};
`

export const TokenText = styled.div`
  display: flex;
  align-items: center;
  text-align: left;
  margin: 0 0 0 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
  font-variant-numeric: tabular-nums;

  > span {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: flex-start;
    max-width: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    gap: 2px;
  }

  > span > b {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    font-weight: 600;
    display: inline-block;
  }

  > span > i {
    opacity: 0.6;
    font-style: normal;
    font-size: 14px;
    font-weight: 500;
    width: 100%;
    display: inline-block;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 13px;
  `};
`

export const ApproveLabel = styled.span<{ color?: string }>`
  color: ${({ theme, color }) => color || theme.text1};
  font-weight: 500;
`

export const CustomLimit = styled.div`
  > span:last-child {
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
  stroke: var(${UI.COLOR_TEXT1});
  width: 15px;
  height: 15px;
  margin-left: 5px;
  vertical-align: middle;
  margin-bottom: 2px;
`

export const NoResults = styled.div`
  color: inherit;
  min-height: 400px;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-height: 200px;
    margin: 0 auto 0 0;
    overflow-x: auto;
  `};

  > h3 {
    font-size: 24px;
    font-weight: 500;
    margin: 0 auto;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size: 16px;
      text-align: left;
      margin: 16px;
    `};
  }
`
